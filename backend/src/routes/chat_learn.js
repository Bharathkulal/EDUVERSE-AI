const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { decrypt } = require('../utils/crypto');

const router = express.Router();

// Setup upload directory
const uploadDir = path.join(__dirname, '../../uploads/chat_learn');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Helper: Securely fetch Gemini API key for multimodal requests
const getGeminiKey = async () => {
  const result = await db.query(
    "SELECT api_key FROM api_configurations WHERE provider = 'gemini' AND disabled = false"
  );
  if (result.rows.length > 0 && result.rows[0].api_key) {
    try {
      return decrypt(result.rows[0].api_key);
    } catch (e) {
      console.error('Error decrypting Gemini API key:', e.message);
    }
  }
  return process.env.GEMINI_API_KEY || null;
};

// Helper: Parse Excel sheets to text
const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += `\n--- Sheet: ${sheetName} ---\n`;
      text += xlsx.utils.sheet_to_txt(sheet) + '\n';
    });
    return text;
  } catch (err) {
    console.error('Excel Parsing Error:', err);
    return '[Error parsing Excel document]';
  }
};

// 1. Get all chat sessions for student
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      'SELECT * FROM chat_sessions WHERE student_id = $1 ORDER BY pinned DESC, updated_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving chat sessions.' });
  }
});

// 2. Create new chat session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, collection_name } = req.body;
    const result = await db.query(
      'INSERT INTO chat_sessions (student_id, title, collection_name) VALUES ($1, $2, $3) RETURNING *',
      [studentId, title || 'New Chat', collection_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating chat session.' });
  }
});

// 3. Update chat session (Pin, Favorite, Share, Rename, Collection/Folder)
router.put('/sessions/:id', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessionId = req.params.id;
    const { title, pinned, favorite, shared, collection_name } = req.body;

    const sessionCheck = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND student_id = $2',
      [sessionId, studentId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (pinned !== undefined) {
      updates.push(`pinned = $${paramIndex++}`);
      values.push(pinned);
    }
    if (favorite !== undefined) {
      updates.push(`favorite = $${paramIndex++}`);
      values.push(favorite);
    }
    if (shared !== undefined) {
      updates.push(`shared = $${paramIndex++}`);
      values.push(shared);
    }
    if (collection_name !== undefined) {
      updates.push(`collection_name = $${paramIndex++}`);
      values.push(collection_name);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(sessionId);
    values.push(studentId);
    const query = `UPDATE chat_sessions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex++} AND student_id = $${paramIndex++} RETURNING *`;
    
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating chat session.' });
  }
});

// 4. Delete chat session
router.delete('/sessions/:id', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessionId = req.params.id;

    const result = await db.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND student_id = $2 RETURNING id',
      [sessionId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    res.json({ message: 'Chat session deleted successfully.', id: sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting chat session.' });
  }
});

// 5. Get message history for session
router.get('/sessions/:id/messages', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessionId = req.params.id;

    const sessionCheck = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND student_id = $2',
      [sessionId, studentId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    const messages = await db.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
});

// 6. Handle file uploads
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/chat_learn/${req.file.filename}`;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let parsedText = '';

    // Handle document text parsing
    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      parsedText = data.text;
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      parsedText = parseExcel(req.file.path);
    } else if (['.txt', '.csv'].includes(fileExtension)) {
      parsedText = fs.readFileSync(req.file.path, 'utf8');
    } else {
      parsedText = `[Uploaded ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)]`;
    }

    res.json({
      file_url: fileUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      parsed_text: parsedText.slice(0, 50000) // Truncate very long files to fit model context
    });
  } catch (err) {
    console.error('File Upload/Parse Error:', err);
    res.status(500).json({ message: 'Error processing uploaded file.' });
  }
});

// 7. Post a message to session
router.post('/sessions/:id/messages', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessionId = req.params.id;
    const { content, multimodal_type, file_url, file_name, file_size, parsed_text, api_tool } = req.body;

    const sessionCheck = await db.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND student_id = $2',
      [sessionId, studentId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    // Save user message to database
    const userMsgRes = await db.query(
      `INSERT INTO chat_messages (session_id, role, content, multimodal_type, file_url, file_name, file_size) 
       VALUES ($1, 'user', $2, $3, $4, $5, $6) RETURNING *`,
      [sessionId, content, multimodal_type || null, file_url || null, file_name || null, file_size || null]
    );

    // Fetch user preferences
    const prefRes = await db.query(
      'SELECT * FROM chat_preferences WHERE student_id = $1',
      [studentId]
    );
    const pref = prefRes.rows[0] || {
      preferred_language: 'English',
      preferred_model: 'gemini-2.0-flash',
      learning_mode_enabled: false
    };

    // Get chat history for memory context (last 8 messages)
    const historyRes = await db.query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 8',
      [sessionId]
    );
    const chatMemory = historyRes.rows.reverse();

    // Construct prompts & system settings
    let systemInstruction = `You are a Principal AI Educational Assistant within the EduVerse AI platform.
    Conduct all explanations in ${pref.preferred_language}. 
    Deliver rich markdown tables, syntax-highlighted code blocks, LaTeX mathematical formats ($...$ and $$...$$), and Mermaid flowchart/mindmap nodes where appropriate.`;

    if (api_tool) {
      const toolInstructions = {
        'AI Tutor': '\nAct as an expert university tutor. Simplify complex topics with structures.',
        'Homework Helper': '\nProvide step-by-step problem-solving instructions for educational assignments.',
        'Programming Assistant': '\nFocus on software engineering, debugging, compiler properties, and algorithms.',
        'Math Solver': '\nProvide detailed step-by-step derivations, calculations, and LaTeX equations.',
        'Science Tutor': '\nDetail scientific principles, chemistry compounds, biology mechanisms, and experiments.',
        'Electronics Expert': '\nHelp with electrical circuits, component designs, and hardware architectures.',
        'Hardware Expert': '\nFocus on physical computer assembly components, microprocessors, and device boards.',
        'Networking Expert': '\nDetail OSI/TCP-IP models, packet routings, firewalls, and network configurations.',
        'Career Advisor': '\nAdvise on career roadmaps, industrial domains, interview protocols, and profiles.',
        'Resume Analyzer': '\nAnalyze resumes, suggest structural changes, highlight skill gaps, and improve summaries.',
        'Interview Coach': '\nSimulate mock interview questions, review student answers, and give feedback.',
        'Research Assistant': '\nAnalyze research abstracts, literature publications, citations, and summaries.'
      };
      systemInstruction += toolInstructions[api_tool] || '';
    }

    if (pref.learning_mode_enabled) {
      systemInstruction += `\n[MANDATORY SPECIAL LEARNING MODE] Every response MUST include:
      - Difficulty Level: (Beginner, Intermediate, or Advanced based on topic complexity)
      - Simple Explanation: (An intuitive explanation in plain language)
      - Detailed Explanation: (A deep dive academic breakdown)
      - Real-world Example: (A practical, tangible application)
      - Visualization: (A Mermaid diagram, ASCII flowchart, or structural outline describing the concept visually)
      - Quiz: (3 multiple-choice questions with option letters A, B, C, D and the correct answer listed separately)
      - Flashcards: (2 flashcard concepts formatted as Question/Answer)
      - Important Points: (A bulleted list of critical takeaways)
      - Practice Questions: (2 mock exam questions)
      - Related Topics: (Suggestions for further study)`;
    }

    // Handle Multimodal Image Inputs
    let imageAnalysisResult = null;
    let containsRAM = false;

    if (multimodal_type === 'image' && file_url) {
      // Analyze file name / content for RAM
      const normalizedName = (file_name || '').toLowerCase();
      const normalizedMsg = content.toLowerCase();
      if (normalizedName.includes('ram') || normalizedMsg.includes('ram') || normalizedMsg.includes('random access memory')) {
        containsRAM = true;
      }
      
      const geminiKey = await getGeminiKey();
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: pref.preferred_model || 'gemini-2.0-flash' });
          const localPath = path.join(__dirname, '../../', file_url);
          if (fs.existsSync(localPath)) {
            const imageBuffer = fs.readFileSync(localPath);
            const imagePart = {
              inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
              }
            };
            
            const imagePrompt = `Identify the objects, read any text, and recognize diagrams/charts/graphs/electronics/chemistry structures in this image. Explain everything simply in ${pref.preferred_language}. User Query: ${content}`;
            const resGemini = await model.generateContent([imagePrompt, imagePart]);
            imageAnalysisResult = resGemini.response.text();
            if (imageAnalysisResult.toLowerCase().includes('ram') || imageAnalysisResult.toLowerCase().includes('random access memory')) {
              containsRAM = true;
            }
          }
        } catch (visionErr) {
          console.error('Vision API Error:', visionErr);
        }
      }
    }

    // Assemble final text context
    let contextHistoryText = chatMemory.map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n');
    let promptText = `System Instructions:\n${systemInstruction}\n\nChat Memory:\n${contextHistoryText}\n\n`;

    if (parsed_text) {
      promptText += `Uploaded Document Content Context:\n${parsed_text}\n\n`;
    }

    promptText += `Student Question: ${content}`;

    let responseText = '';
    let apiCallResult = null;

    if (imageAnalysisResult) {
      responseText = imageAnalysisResult;
    } else {
      try {
        apiCallResult = await aiGateway.generateResponse(promptText, {
          systemInstruction
        });
        responseText = apiCallResult.text;
      } catch (err) {
        console.error('AI error in chat learn, falling back to Demo Mode:', err);
      }
    }

    if (!responseText) {
      // Demo response fallback
      responseText = `[Demo Mode - Configure LLM Provider API Key for Live AI]

Here is a standard response regarding your query "${content}":

1. **Overview**: In computer science and college education, this represents a core conceptual block.
2. **Context Details**: It operates by coordinating structured parameters and logic.
3. **Important Points**:
   - Break complex systems into modules.
   - Maintain clean variables.
   - Verify inputs.

Would you like to try generating practice quiz questions or notes?`;
    }

    // Handle RAM specific explanation cards
    if (containsRAM) {
      responseText += `\n\n### 🔮 Hardware Highlight: Random Access Memory (RAM)
      
- **Definition**: RAM is high-speed, volatile temporary physical storage used by CPUs to keep active operational applications and data readily accessible.
- **Working**: The CPU fetches memory addresses from RAM via high-speed system buses instead of accessing the slow storage drive, allowing instantaneous reading and writing of bytes.
- **Types**:
  1. *SRAM (Static RAM)*: Uses flip-flops, faster, more expensive, used for CPU cache.
  2. *DRAM (Dynamic RAM)*: Uses capacitors, requires refreshing, higher density, used for main system memory (DDR4/DDR5).
- **Advantages**: Dramatically speeds up system multi-tasking and provides zero CPU execution bottlenecks.
- **Applications**: Running operating systems, compiling code, rendering games, loading large datasets.
- **Common Problems**: Hardware failures (leads to Blue Screens / Beep codes), RAM running out (spills over into virtual swap storage causing severe lag).
- **Related Topics**: Virtual Memory, CPU Cache Registers, DDR5 Bus Architecture.

#### 💡 Hardware Diagnostics Quiz
1. Why is RAM called volatile? (Answer: It loses its memory data immediately when power is shut down).
2. What does double data rate (DDR) do? (Answer: Transfers data on both the rising and falling edges of the clock signal).

#### 💼 Placement/Interview Focus
*Question*: Distinguish SRAM from DRAM. 
*Answer*: SRAM is faster, volatile, holds data without refresh, uses more transistors per bit, and is used for caches. DRAM is slower, dynamic, requires periodic refresh charges, and acts as primary memory.

> [!TIP]
> **EduVerse 3D TechVerse**: You can inspect and interact with a fully detailed 3D model of a RAM chip in our TechVerse system! [Launch 3D RAM Visualizer (TechVerse)](file:///techverse#ram)`;
    }

    // Save AI response message to database
    const assistantMsgRes = await db.query(
      `INSERT INTO chat_messages (session_id, role, content, detected_metadata) 
       VALUES ($1, 'assistant', $2, $3) RETURNING *`,
      [sessionId, responseText, JSON.stringify({ containsRAM, apiUsed: !!apiCallResult })]
    );

    // Update session timestamp
    await db.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1', [sessionId]);

    res.json({
      userMessage: userMsgRes.rows[0],
      assistantMessage: assistantMsgRes.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing message.' });
  }
});

// 8. Get/Set Student AI Preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM chat_preferences WHERE student_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      // Return defaults
      return res.json({
        preferred_language: 'English',
        preferred_model: 'gemini-2.0-flash',
        learning_mode_enabled: false,
        voice_enabled: false
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving AI preferences.' });
  }
});

router.post('/preferences', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferred_language, preferred_model, learning_mode_enabled, voice_enabled } = req.body;

    const result = await db.query(
      `INSERT INTO chat_preferences (student_id, preferred_language, preferred_model, learning_mode_enabled, voice_enabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (student_id) 
       DO UPDATE SET 
         preferred_language = EXCLUDED.preferred_language,
         preferred_model = EXCLUDED.preferred_model,
         learning_mode_enabled = EXCLUDED.learning_mode_enabled,
         voice_enabled = EXCLUDED.voice_enabled,
         updated_at = NOW()
       RETURNING *`,
      [
        studentId,
        preferred_language || 'English',
        preferred_model || 'gemini-2.0-flash',
        learning_mode_enabled ?? false,
        voice_enabled ?? false
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving AI preferences.' });
  }
});

// 9. Get Prompt Templates
router.get('/prompts', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      'SELECT * FROM prompt_templates WHERE student_id IS NULL OR student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving prompt templates.' });
  }
});

router.post('/prompts', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, prompt, category } = req.body;

    if (!title || !prompt) {
      return res.status(400).json({ message: 'Title and prompt text are required.' });
    }

    const result = await db.query(
      'INSERT INTO prompt_templates (student_id, title, prompt, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, title, prompt, category || 'Custom']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating prompt template.' });
  }
});

// 10. Student Machine Learning Analytics
router.get('/ml-analytics', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check if recommendations already exist
    let recs = await db.query(
      'SELECT * FROM student_recommendations WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5',
      [studentId]
    );

    if (recs.rows.length === 0) {
      // Simulate detection using progress details
      const progressResult = await db.query(
        'SELECT completed_topics, study_hours FROM student_progress WHERE student_id = $1',
        [studentId]
      );
      const progress = progressResult.rows[0] || { completed_topics: 2, study_hours: 4.5 };
      
      const quizResult = await db.query(
        'SELECT AVG(score)::decimal(5,2) as avg_score FROM quiz_results WHERE student_id = $1',
        [studentId]
      );
      const avgQuizScore = quizResult.rows[0]?.avg_score || 72.5;

      const dummyRecs = [
        { weak_topic: 'Object Oriented Programming', pattern: 'Low quiz retention in unit 2', study_time_prediction: 120, predicted_score: 68.0, action: 'Review class objects and constructors. Try rewriting inheritance blueprints.' },
        { weak_topic: 'Database Joins', pattern: 'Slow question submission in queries', study_time_prediction: 90, predicted_score: 74.5, action: 'Practice Outer/Inner Joins on the interactive DBMS Lab.' },
        { weak_topic: 'Recursion Algorithms', pattern: 'High compiler failure logs', study_time_prediction: 150, predicted_score: 61.2, action: 'Trace factorial call stacks step-by-step. Solve simple fibonacci iterations.' }
      ];

      for (const d of dummyRecs) {
        await db.query(
          `INSERT INTO student_recommendations (student_id, weak_topic, detected_pattern, study_time_prediction_mins, predicted_score, recommended_action)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [studentId, d.weak_topic, d.pattern, d.study_time_prediction, d.predicted_score, d.action]
        );
      }

      recs = await db.query(
        'SELECT * FROM student_recommendations WHERE student_id = $1 ORDER BY created_at DESC',
        [studentId]
      );
    }

    res.json({
      recommendations: recs.rows,
      learningPattern: 'Sequential learner with evening study spikes',
      examScorePrediction: '78.2%',
      studyTimePredictionMinutes: 280,
      adaptiveQuizDifficulty: 'Medium-Hard'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving learning recommendations.' });
  }
});

// 11. Generated files manager
router.get('/generated-files', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      'SELECT * FROM generated_educational_files WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error listing files.' });
  }
});

router.post('/generate-file', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { name, type, topic } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'File name and file type are required.' });
    }

    // Create uploads/chat_learn/files if not exists
    const filesDir = path.join(uploadDir, 'files');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    const cleanName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(filesDir, cleanName);
    const fileUrl = `/uploads/chat_learn/files/${cleanName}`;

    let fileContent = `EduVerse AI Generated Educational File\nTopic: ${topic || 'General'}\nGenerated Date: ${new Date().toLocaleString()}\n\n`;

    if (type === 'pdf') {
      fileContent += `--- STUDY PLAN & SUMMARY NOTES ---\nThis document contains curated learning outlines, quiz references, and practice answers for: ${topic || 'educational topics'}.\n`;
    } else if (type === 'document') {
      fileContent += `--- TERM REPORT / ESSAY OUTLINE ---\n1. Introduction\n2. Key Theoretical Background\n3. Practical Implementation & Analysis\n4. Conclusion\n`;
    } else if (type === 'slides') {
      fileContent += `--- PRESENTATION DECK SLIDES ---\n[Slide 1: Title] ${topic || 'Study Review'}\n[Slide 2: Objectives] core details\n[Slide 3: Working] step-by-step points\n[Slide 4: Summary]\n`;
    } else {
      fileContent += `--- COMPILER CODE PROJECT ---\n// Educational source code boilerplate\nconsole.log("EduVerse System active on ${topic}");\n`;
    }

    fs.writeFileSync(filePath, fileContent);

    // Save tracking in database
    const result = await db.query(
      `INSERT INTO generated_educational_files (student_id, file_name, file_type, file_url, folder_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studentId, name, type, fileUrl, type.toUpperCase()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('File generation error:', err);
    res.status(500).json({ message: 'Error generating file asset.' });
  }
});

module.exports = router;
