import React, { useState, useEffect, useRef } from 'react';
import './ExamCommandCenter.css';

// Initialize Web Speech API safely
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
}

export default function ExamCommandCenter() {
  const [activeView, setActiveView] = useState('oral');

  // ==========================================
  // 1. AI ORAL EXAM STATE
  // ==========================================
  const [oralQuestion, setOralQuestion] = useState(
    "Describe how backpropagation uses the chain rule to update weights in a neural network."
  );
  const [oralTranscript, setOralTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [oralHistory, setOralHistory] = useState([
    {
      q: "What is the primary difference between overfitting and underfitting?",
      a: "Overfitting is when the model performs exceptionally well on the training data but fails to generalize to validation data. Underfitting is when the model cannot learn the underlying patterns even on training data.",
      score: 94
    }
  ]);
  const [oralMetrics, setOralMetrics] = useState({
    pronunciation: 92,
    fluency: 88,
    grammar: 94,
    confidence: 90,
    criticalThinking: 85,
    problemSolving: 89,
    professionalComms: 91
  });
  const [selectedSubject, setSelectedSubject] = useState("Machine Learning");

  // Web Speech: TTS
  const speakQuestion = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech: STT
  const startSpeechCapture = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }
    setOralTranscript("");
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setOralTranscript(resultText);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopSpeechCapture = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const submitOralAnswer = () => {
    if (!oralTranscript.trim()) return;
    const mockScore = Math.floor(Math.random() * 15) + 80; // 80 - 95
    const newHistoryItem = {
      q: oralQuestion,
      a: oralTranscript,
      score: mockScore
    };
    setOralHistory([newHistoryItem, ...oralHistory]);
    
    // Recalculate mock metrics
    setOralMetrics({
      pronunciation: Math.floor(Math.random() * 10) + 88,
      fluency: Math.floor(Math.random() * 12) + 85,
      grammar: Math.floor(Math.random() * 10) + 88,
      confidence: Math.floor(Math.random() * 10) + 87,
      criticalThinking: Math.floor(Math.random() * 15) + 80,
      problemSolving: Math.floor(Math.random() * 15) + 80,
      professionalComms: Math.floor(Math.random() * 10) + 89,
    });

    // Auto follow-up questions
    const followUps = [
      "Excellent. How does adding L1 or L2 regularization prevent overfitting in this scenario?",
      "Now, explain the mathematical intuition behind the gradient vanishing problem in deep networks.",
      "How would you optimize the learning rate dynamically during training to solve these optimization issues?",
      "Can you provide a real-world scenario where a simple linear model would outperform deep networks?"
    ];
    const nextQ = followUps[Math.floor(Math.random() * followUps.length)];
    setOralQuestion(nextQ);
    setOralTranscript("");
    speakQuestion(nextQ);
  };

  // ==========================================
  // 2. AI VIVA EXAMINER STATE
  // ==========================================
  const [vivaDifficulty, setVivaDifficulty] = useState("medium");
  const [vivaQuestion, setVivaQuestion] = useState(
    "Generate a Python implementation for a custom binary search tree insert method. Explain complexity analysis."
  );
  const [vivaAnswerText, setVivaAnswerText] = useState("");
  const [vivaHistory, setVivaHistory] = useState([
    {
      q: "Explain what happens in memory when we instantiate a linked list vs an array.",
      a: "Arrays occupy a contiguous block of memory, allowing O(1) random access. Linked lists are fragmented, using pointers to reference next nodes, resulting in O(n) lookup but O(1) insertion."
    }
  ]);
  const [activeHint, setActiveHint] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [vivaReport, setVivaReport] = useState({
    subjectKnowledge: 87,
    reasoning: 89,
    confidence: 90,
    communication: 84,
    technicalDepth: 91,
    presentation: 86,
    decisionMaking: 88
  });

  const getVivaHint = () => {
    const hints = [
      "Remember: the node should compare value with current node, branching left if smaller and right if larger, recursively.",
      "Ensure you handle the base case where root is null and create a new Node object.",
      "Time complexity should be O(log n) on average, but could degrade to O(n) if the tree is unbalanced."
    ];
    setActiveHint(hints[Math.floor(Math.random() * hints.length)]);
    setShowHint(true);
  };

  const challengeVivaAnswer = () => {
    setVivaQuestion(`Your explanation relies on key assumptions. What if the tree is highly skewed or linear? How would you balance it?`);
    setVivaAnswerText("");
  };

  const requestRealWorldExample = () => {
    setVivaQuestion(`Can you provide a practical real-world scenario where a Binary Search Tree is preferred over a Hash Map?`);
    setVivaAnswerText("");
  };

  const submitVivaAnswer = () => {
    if (!vivaAnswerText.trim()) return;
    const historyItem = {
      q: vivaQuestion,
      a: vivaAnswerText
    };
    setVivaHistory([historyItem, ...vivaHistory]);
    setVivaAnswerText("");

    // Simulate difficulty adaptation
    const randomNextVal = Math.random();
    if (randomNextVal > 0.6) {
      setVivaDifficulty("hard");
      setVivaQuestion("Under conditions of high concurrency, how would you design a self-balancing AVL or Red-Black Tree that avoids locking the entire tree structure?");
    } else if (randomNextVal < 0.2) {
      setVivaDifficulty("easy");
      setVivaQuestion("Let's simplify. Draw a diagram of a tree with root 10, left child 5, right child 15. Where does 8 fit in?");
    } else {
      setVivaDifficulty("medium");
      setVivaQuestion("Implement a preorder, inorder, and postorder traversal on the tree. What are their recursive complexity metrics?");
    }
    setShowHint(false);
  };

  // ==========================================
  // 3. EXAM REPLAY ENGINE STATE
  // ==========================================
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(25);
  const [replayActiveQ, setReplayActiveQ] = useState(0);
  const [replayBookmarks, setReplayBookmarks] = useState([1]);
  const [replayFlags, setReplayFlags] = useState([2]);
  const [replayScreenFeed, setReplayScreenFeed] = useState("screen-normal");

  const replayQuestionsList = [
    { id: 0, q: "Identify the gradient descent learning rate formula.", a: "W = W - alpha * dW", time: "45s", isFlagged: false },
    { id: 1, q: "Explain dynamic programming memoization.", a: "Storing results of expensive function calls to return cached values.", time: "112s", isFlagged: false },
    { id: 2, q: "Analyze the complexity of heap sort.", a: "Heap sort has O(n log n) best, average, and worst-case time complexity.", time: "85s", isFlagged: true },
    { id: 3, q: "Discuss CAP Theorem in distributed databases.", a: "Consistency, Availability, Partition tolerance - pick two.", time: "134s", isFlagged: false }
  ];

  useEffect(() => {
    let interval = null;
    if (replayPlaying) {
      interval = setInterval(() => {
        setReplayProgress((p) => {
          if (p >= 100) {
            setReplayPlaying(false);
            return 100;
          }
          return p + 1;
        });
      }, 800);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [replayPlaying]);

  const toggleBookmark = (id) => {
    if (replayBookmarks.includes(id)) {
      setReplayBookmarks(replayBookmarks.filter(b => b !== id));
    } else {
      setReplayBookmarks([...replayBookmarks, id]);
    }
  };

  const toggleFlag = (id) => {
    if (replayFlags.includes(id)) {
      setReplayFlags(replayFlags.filter(f => f !== id));
    } else {
      setReplayFlags([...replayFlags, id]);
    }
  };

  // ==========================================
  // 4. LEARNING GAP HEATMAP STATE
  // ==========================================
  const [heatmapTab, setHeatmapTab] = useState("blooms");
  const heatmapData = [
    { name: "Supervised Learning", score: 92, status: "mastered", blooms: "Remembering", chapter: "Ch 1" },
    { name: "Gradient Descent", score: 74, status: "average", blooms: "Understanding", chapter: "Ch 2" },
    { name: "CNN Layers", score: 85, status: "mastered", blooms: "Applying", chapter: "Ch 3" },
    { name: "Regularization", score: 55, status: "weak", blooms: "Analyzing", chapter: "Ch 4" },
    { name: "Transformer Nodes", score: 48, status: "weak", blooms: "Evaluating", chapter: "Ch 5" },
    { name: "GAN Architectures", score: 38, status: "weak", blooms: "Creating", chapter: "Ch 6" },
    { name: "Recurrent Networks", score: 70, status: "average", blooms: "Applying", chapter: "Ch 3" },
    { name: "SVM Classifiers", score: 89, status: "mastered", blooms: "Analyzing", chapter: "Ch 2" },
    { name: "Decision Trees", score: 94, status: "mastered", blooms: "Understanding", chapter: "Ch 1" },
    { name: "K-Means Clustering", score: 62, status: "average", blooms: "Evaluating", chapter: "Ch 7" },
  ];

  const filteredHeatmap = heatmapData.filter(item => {
    if (heatmapTab === "blooms") return true;
    if (heatmapTab === "weak") return item.status === "weak";
    if (heatmapTab === "mastered") return item.status === "mastered";
    return true;
  });

  // ==========================================
  // 5. TEACHER AI COPILOT STATE
  // ==========================================
  const [copilotSubject, setCopilotSubject] = useState("Computer Science");
  const [copilotTopic, setCopilotTopic] = useState("Relational Databases");
  const [copilotType, setCopilotType] = useState("quiz");
  const [copilotDiff, setCopilotDiff] = useState("Medium");
  const [copilotBloom, setCopilotBloom] = useState("Applying");
  const [generatedExamText, setGeneratedExamText] = useState("");
  const [isDyslexicView, setIsDyslexicView] = useState(false);

  const generateCopilotExam = () => {
    let mockContent = `====================================================
AI GENERATED ASSESSMENT: ${copilotSubject}
TOPIC: ${copilotTopic} | DIFFICULTY: ${copilotDiff}
BLOOM'S TAXONOMY LEVEL: ${copilotBloom}
====================================================

PART A: CORE CONCEPT CHECK (Bloom Level: Remembering/Understanding)
1. Explain the relational algebra difference operator and state its significance.
   Answer Scheme: Represents tuple differences. Requires matching schemas.

PART B: DYNAMIC CODING/PRACTICAL CHALLENGE (Bloom Level: Applying/Analyzing)
2. Consider a database containing schema Employees(id, name, salary, dept_id).
   Write a query to extract all employees earning more than the average salary of their respective departments.
   SQL Answer Key:
   SELECT name, salary FROM Employees E1 WHERE salary > (
       SELECT AVG(salary) FROM Employees E2 WHERE E2.dept_id = E1.dept_id
   );

PART C: HIGH ORDER THINKING SKILL (HOTS) SCENARIO (Bloom Level: Evaluating/Creating)
3. CASE STUDY: You are scaling an e-commerce catalog DB. Read operations exceed writes 100:1.
   Argue the trade-offs of adopting a NoSQL Document Store (e.g., MongoDB) vs maintaining SQL InnoDB with replication.
   Marking Scheme Rubric:
   - Consistency & ACID impacts: [3 Points]
   - Read latency & horizontal scale analysis: [4 Points]
   - Schema flexibility & joins evaluation: [3 Points]`;

    setGeneratedExamText(mockContent);
  };

  // ==========================================
  // 6. INSTITUTION ANALYTICS STATE
  // ==========================================
  const [analyticsDept, setAnalyticsDept] = useState("All Departments");
  
  const simulatedExcelDownload = (filename, data) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value,Status\n";
    data.forEach(row => {
      csvContent += `${row.metric},${row.val},${row.status || 'Active'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerDownload = (format) => {
    const metrics = [
      { metric: "Institution Performance Index", val: "91.4%" },
      { metric: "Course Completion Rate", val: "96.8%" },
      { metric: "Average Viva Score", val: "84.2/100" },
      { metric: "Predicted Graduation placement readiness", val: "88.5%" },
      { metric: "Active Dropout Risk Alerts", val: "3" }
    ];
    if (format === 'csv' || format === 'excel') {
      simulatedExcelDownload(`eduverse_assessment_report_${Date.now()}`, metrics);
    } else {
      alert(`Exporting high-fidelity dashboard report as ${format.toUpperCase()}... Check downloads folder.`);
    }
  };

  // ==========================================
  // 7. PERFORMANCE PREDICTION STATE
  // ==========================================
  const predictionFactors = [
    { text: "Consistency in viva voice articulation clarity (+0.4 CGPA)", type: "positive" },
    { text: "Smart remediation mock practice tests completion (+0.3 CGPA)", type: "positive" },
    { text: "Time distribution gaps in critical thinking modules (-0.15 Expected)", type: "negative" },
    { text: "Frequent tab focus loss events during proctored exams (-0.2 expected)", type: "negative" }
  ];

  // ==========================================
  // 8. SMART REMEDIATION STATE
  // ==========================================
  const [remediationTab, setRemediationTab] = useState("flashcards");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const remediationFlashcards = [
    { q: "What does the 'A' represent in CAP theorem?", a: "Availability - Every non-failing node returns a non-error response, without guarantee that it contains the most recent write." },
    { q: "Define Overfitting in simple terms.", a: "When a model learns the noise and details of training data too well, damaging validation accuracy." },
    { q: "What is an L1 regularization effect?", a: "L1 (Lasso) adds absolute magnitude of coefficient weights to the cost function, causing weights of unimportant features to become exactly zero." }
  ];

  // ==========================================
  // 9. AI PROCTORING STATE
  // ==========================================
  const [proctorSensitivity, setProctorSensitivity] = useState("high");
  const [proctorActive, setProctorActive] = useState(true);
  const [proctorLog, setProctorLog] = useState([
    { time: "08:44:18", type: "info", text: "Identity Verified (User ID: EduStudent99)." },
    { time: "08:45:01", type: "info", text: "Proctor active. Dual display check passed." },
  ]);
  const [proctorFaceState, setProctorFaceState] = useState("Green");
  const [proctorIntegrityScore, setProctorIntegrityScore] = useState(100);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!proctorActive) return;

    let animId = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let eyeTargetX = 100;
    let eyeTargetY = 90;
    let delta = 1;

    const drawCameraFeed = () => {
      // Clear
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw face wireframe
      ctx.strokeStyle = proctorFaceState === "Green" ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 40, 100, 110);

      // Draw face target scanner corners
      ctx.fillStyle = proctorFaceState === "Green" ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(50, 40, 100, 110);

      // Draw eye tracking indicators
      ctx.fillStyle = '#06b6d4';
      eyeTargetX += delta;
      if (eyeTargetX > 105 || eyeTargetX < 95) delta = -delta;
      
      // Draw eyes target
      ctx.beginPath();
      ctx.arc(80, 85, 3, 0, Math.PI * 2);
      ctx.arc(120, 85, 3, 0, Math.PI * 2);
      ctx.fill();

      // Alert markers
      if (proctorFaceState === "Red") {
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(100, 95, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px monospace';
        ctx.fillText("MULTIPLE FACES OR FOCUS LOSS DETECTED", 10, 20);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.font = '10px monospace';
        ctx.fillText("EYES FOCUS TRACKING: STABLE", 10, 20);
      }

      animId = requestAnimationFrame(drawCameraFeed);
    };

    drawCameraFeed();
    return () => cancelAnimationFrame(animId);
  }, [proctorActive, proctorFaceState]);

  // Tab blur proctor simulator
  useEffect(() => {
    const handleBlur = () => {
      if (!proctorActive) return;
      setProctorFaceState("Red");
      setProctorIntegrityScore(prev => Math.max(0, prev - 15));
      const timeStr = new Date().toTimeString().split(' ')[0];
      setProctorLog(prev => [
        { time: timeStr, type: "danger", text: "Alert: Focus lost. Window blurred / tab changed!" },
        ...prev
      ]);
    };

    const handleFocus = () => {
      if (!proctorActive) return;
      setTimeout(() => {
        setProctorFaceState("Green");
      }, 2000);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [proctorActive]);

  // Simulate mouse/copy detection
  const triggerCopyAlert = (e) => {
    if (!proctorActive) return;
    const timeStr = new Date().toTimeString().split(' ')[0];
    setProctorIntegrityScore(prev => Math.max(0, prev - 10));
    setProctorLog(prev => [
      { time: timeStr, type: "warn", text: "Alert: Copy shortcut command triggered!" },
      ...prev
    ]);
  };

  // ==========================================
  // 10. ADVANCED REPORTING STATE
  // ==========================================
  const [reportingRole, setReportingRole] = useState("student");

  // Render components
  return (
    <div className="ecc-container">
      {/* Sidebar Navigation */}
      <div className="ecc-sidebar">
        <div className="ecc-sidebar-title">Assessment modules</div>
        
        <button className={`ecc-nav-item ${activeView === 'oral' ? 'active' : ''}`} onClick={() => setActiveView('oral')}>
          <span className="ecc-nav-icon">🎙️</span>
          <span>AI Oral Exam</span>
        </button>
        
        <button className={`ecc-nav-item ${activeView === 'viva' ? 'active' : ''}`} onClick={() => setActiveView('viva')}>
          <span className="ecc-nav-icon">🤖</span>
          <span>AI Viva Examiner</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'replay' ? 'active' : ''}`} onClick={() => setActiveView('replay')}>
          <span className="ecc-nav-icon">🔄</span>
          <span>Replay Engine</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveView('heatmap')}>
          <span className="ecc-nav-icon">🗺️</span>
          <span>Gap Heatmap</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'copilot' ? 'active' : ''}`} onClick={() => setActiveView('copilot')}>
          <span className="ecc-nav-icon">👨‍🏫</span>
          <span>Teacher Copilot</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'analytics' ? 'active' : ''}`} onClick={() => setActiveView('analytics')}>
          <span className="ecc-nav-icon">📊</span>
          <span>Analytics Center</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'prediction' ? 'active' : ''}`} onClick={() => setActiveView('prediction')}>
          <span className="ecc-nav-icon">🔮</span>
          <span>CGPA Predictions</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'remediation' ? 'active' : ''}`} onClick={() => setActiveView('remediation')}>
          <span className="ecc-nav-icon">🩹</span>
          <span>Remediation Hub</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'proctoring' ? 'active' : ''}`} onClick={() => setActiveView('proctoring')}>
          <span className="ecc-nav-icon">🛡️</span>
          <span>AI Proctoring</span>
        </button>

        <button className={`ecc-nav-item ${activeView === 'reports' ? 'active' : ''}`} onClick={() => setActiveView('reports')}>
          <span className="ecc-nav-icon">📄</span>
          <span>Advanced Reports</span>
        </button>
      </div>

      {/* Main Workspace content */}
      <div className="ecc-content" onCopy={triggerCopyAlert}>
        
        {/* ==========================================
            VIEW 1: AI ORAL EXAM MODE
            ========================================== */}
        {activeView === 'oral' && (
          <div className="oral-exam-panel">
            <div className="ecc-view-header">
              <div className="ecc-view-title">
                <h2>🎙️ AI Oral Exam Mode</h2>
                <p>Conduct real-time speech assessment with dynamic difficulty scaling & grammar review.</p>
              </div>
              <div className="ecc-view-actions">
                <select 
                  className="copilot-select" 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option>Machine Learning</option>
                  <option>Data Structures</option>
                  <option>Quantum Computing</option>
                  <option>System Architecture</option>
                </select>
                <button className="ecc-btn ecc-btn-secondary" onClick={() => speakQuestion(oralQuestion)}>
                  🔊 Play Question
                </button>
              </div>
            </div>

            <div className="oral-live-box">
              <div className={`oral-glow-ring ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={isListening ? stopSpeechCapture : startSpeechCapture}>
                {isListening ? "🎙️" : "🎤"}
              </div>
              <p style={{ fontSize: '0.8rem', color: isListening ? '#fca5a5' : '#94a3b8', margin: '0.5rem 0 0 0' }}>
                {isListening ? "Listening... Speak your answer now." : "Click microphone to start voice recording response"}
              </p>
              <div className="oral-question-text">
                {oralQuestion}
              </div>
              <div className={`waveform-sim ${isListening || isSpeaking ? 'active' : ''}`}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">⌨️ Transcript Preview & Submit</h3>
                <textarea
                  className="copilot-textarea"
                  style={{ width: '100%', minHeight: '100px', margin: '0.5rem 0' }}
                  placeholder="Voice transcript will appear here, or you can refine the speech output manually..."
                  value={oralTranscript}
                  onChange={(e) => setOralTranscript(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button className="ecc-btn ecc-btn-primary" onClick={submitOralAnswer}>
                    Submit Response →
                  </button>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📈 Real-time Articulation Analysis</h3>
                <div className="metric-circle-list">
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#a78bfa' }}>{oralMetrics.pronunciation}%</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Pronunciation</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#06b6d4' }}>{oralMetrics.fluency}%</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Fluency</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#10b981' }}>{oralMetrics.grammar}%</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Grammar Accuracy</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#f59e0b' }}>{oralMetrics.confidence}%</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Confidence</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.50rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Critical Thinking</span>
                    <div style={{ fontWeight: 'bold' }}>{oralMetrics.criticalThinking} / 100</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Problem Solving</span>
                    <div style={{ fontWeight: 'bold' }}>{oralMetrics.problemSolving} / 100</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">📖 Oral Exam Session History</h3>
              <div className="viva-history-list">
                {oralHistory.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa' }}>Q: {item.q}</span>
                    <span style={{ fontSize: '0.8rem', color: 'white', paddingLeft: '0.5rem' }}>Answer: "{item.a}"</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Evaluation score: {item.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 2: AI VIVA EXAMINER
            ========================================== */}
        {activeView === 'viva' && (
          <div className="viva-panel">
            <div className="viva-main-flow">
              <div className="ecc-view-header" style={{ border: 'none', padding: 0 }}>
                <div className="ecc-view-title">
                  <h2>🤖 AI Viva Examiner</h2>
                  <p>Challenge conceptual depths, handle scenario analysis & coding viva structures.</p>
                </div>
              </div>

              <div className="ecc-card viva-card">
                <div className="viva-question-header">
                  <span style={{ color: 'var(--hub-primary-light)', fontSize: '0.8rem', fontWeight: 'bold' }}>Active Question</span>
                  <span className={`viva-difficulty ${vivaDifficulty}`}>{vivaDifficulty}</span>
                </div>
                <div className="oral-question-text" style={{ marginTop: 0, fontSize: '1.1rem' }}>
                  {vivaQuestion}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={getVivaHint}>
                    💡 Request Hint
                  </button>
                  <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={challengeVivaAnswer}>
                    ⚡ Challenge Explanation
                  </button>
                  <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={requestRealWorldExample}>
                    🌍 Require Real-world Example
                  </button>
                </div>

                {showHint && (
                  <div className="viva-hints-box" style={{ marginTop: '1rem' }}>
                    <strong>Hint:</strong> {activeHint}
                  </div>
                )}
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📝 Type Response (Supports Markdown & Code)</h3>
                <textarea
                  className="copilot-textarea"
                  style={{ width: '100%', minHeight: '120px', fontFamily: 'monospace' }}
                  placeholder="Type your explanation or coding response here..."
                  value={vivaAnswerText}
                  onChange={(e) => setVivaAnswerText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button className="ecc-btn ecc-btn-primary" onClick={submitVivaAnswer}>
                    Submit Explanation →
                  </button>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">🔄 Viva Conversation History</h3>
                <div className="viva-history-list">
                  {vivaHistory.map((item, idx) => (
                    <div key={idx} className="viva-history-item q">
                      <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#06b6d4' }}>Q: {item.q}</div>
                      <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#f1f5f9' }}>A: {item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="viva-sidebar-metrics">
              <div className="ecc-card" style={{ height: '100%' }}>
                <h3 className="ecc-card-title">📊 Assessment Depth Metrics</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Subject Knowledge</span>
                      <span>{vivaReport.subjectKnowledge}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-primary)', width: `${vivaReport.subjectKnowledge}%`, borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Reasoning Depth</span>
                      <span>{vivaReport.reasoning}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-cyan)', width: `${vivaReport.reasoning}%`, borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Confidence Level</span>
                      <span>{vivaReport.confidence}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-green)', width: `${vivaReport.confidence}%`, borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Communication Style</span>
                      <span>{vivaReport.communication}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-amber)', width: `${vivaReport.communication}%`, borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Technical Depth</span>
                      <span>{vivaReport.technicalDepth}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-primary)', width: `${vivaReport.technicalDepth}%`, borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)', marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--hub-primary-light)' }}>AI CONCEPTUAL RULING:</div>
                  <p style={{ fontSize: '0.7rem', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Student demonstrates strong fundamental memory, but struggles lightly with high-scale edge cases. balancer details are recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 3: EXAM REPLAY ENGINE
            ========================================== */}
        {activeView === 'replay' && (
          <div className="replay-panel">
            <div className="replay-player">
              <div className="replay-video-area">
                {/* Simulated Screen Feed */}
                <div style={{ position: 'absolute', top: 15, left: 15, color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  🔴 RECORDED REPLAY FEED
                </div>
                <div style={{ textAlign: 'center', width: '80%', color: 'var(--hub-text-dim)' }}>
                  <span style={{ fontSize: '2.5rem' }}>🖥️</span>
                  <h4>Interactive Screen Capture Feed</h4>
                  <p style={{ fontSize: '0.75rem' }}>Code compiler window focus activity: <strong>Stable (98%)</strong></p>
                </div>
                
                {/* Simulated webcam PIP */}
                <div className="replay-pip-webcam">
                  <div style={{ position: 'absolute', bottom: 5, left: 5, color: '#10b981', fontSize: '0.6rem', fontWeight: 'bold' }}>
                    🎥 Webcam Replay
                  </div>
                  <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                    👤
                  </div>
                </div>
              </div>

              <div className="replay-controls">
                <div className="replay-timeline-slider">
                  <span>0:32</span>
                  <div className="replay-slider-bar" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setReplayProgress((clickX / rect.width) * 100);
                  }}>
                    <div className="replay-slider-fill" style={{ width: `${replayProgress}%` }} />
                    <div className="replay-slider-handle" style={{ left: `${replayProgress}%` }} />
                  </div>
                  <span>2:00</span>
                </div>

                <div className="replay-buttons">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="ecc-btn ecc-btn-secondary" onClick={() => setReplayPlaying(!replayPlaying)}>
                      {replayPlaying ? "⏸️ Pause" : "▶️ Play"}
                    </button>
                    <button className="ecc-btn ecc-btn-secondary" onClick={() => setReplayProgress(0)}>
                      🔄 Reset
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setReplayScreenFeed(p => p === 'screen-normal' ? 'screen-blurred' : 'screen-normal')}>
                      Toggle Blur Mock
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="replay-sidebar">
              <h3 className="ecc-card-title">📖 Exam Timeline Logs</h3>
              <div className="replay-question-list">
                {replayQuestionsList.map((q, idx) => (
                  <div key={idx} className={`replay-q-card ${replayActiveQ === idx ? 'active' : ''}`} onClick={() => setReplayActiveQ(idx)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '80%' }}>
                      <span style={{ fontWeight: 'bold' }}>Q{idx + 1}: {q.q}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Time Spent: {q.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className="bookmark-icon" onClick={(e) => { e.stopPropagation(); toggleBookmark(idx); }}>
                        {replayBookmarks.includes(idx) ? "★" : "☆"}
                      </span>
                      <span className="flag-icon" onClick={(e) => { e.stopPropagation(); toggleFlag(idx); }}>
                        {replayFlags.includes(idx) ? "🚩" : "🏳️"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ecc-card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem' }}>Selected Log Answer View:</h4>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', fontStyle: 'italic' }}>
                  "{replayQuestionsList[replayActiveQ].a}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 4: LEARNING GAP HEATMAP
            ========================================== */}
        {activeView === 'heatmap' && (
          <div className="heatmap-layout">
            <div className="ecc-view-header">
              <div className="ecc-view-title">
                <h2>🗺️ Learning Gap Heatmap</h2>
                <p>Track cognitive performance against Bloom's Taxonomy & Syllabus mapping.</p>
              </div>
              <div className="heatmap-tabs">
                <button className={`heatmap-tab-btn ${heatmapTab === 'blooms' ? 'active' : ''}`} onClick={() => setHeatmapTab('blooms')}>
                  Bloom's Taxonomy
                </button>
                <button className={`heatmap-tab-btn ${heatmapTab === 'weak' ? 'active' : ''}`} onClick={() => setHeatmapTab('weak')}>
                  Weak Topics (Red)
                </button>
                <button className={`heatmap-tab-btn ${heatmapTab === 'mastered' ? 'active' : ''}`} onClick={() => setHeatmapTab('mastered')}>
                  Mastered (Green)
                </button>
              </div>
            </div>

            <div className="heatmap-grid">
              {filteredHeatmap.map((item, idx) => (
                <div key={idx} className={`heatmap-cell ${item.status}`}>
                  <div className="heatmap-cell-score">{item.score}%</div>
                  <div>
                    <div className="heatmap-cell-name">{item.name}</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '0.2rem' }}>
                      {item.blooms} • {item.chapter}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">💡 Personalized Recommendations</h3>
                <div className="remediation-recs">
                  <div className="remediation-rec-card">
                    <span className="remediation-priority-badge priority-high">High Priority</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem' }}>Review Regularization</h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>
                        Score: 55%. Complete the adaptive practice questions and mind maps.
                      </p>
                    </div>
                  </div>

                  <div className="remediation-rec-card">
                    <span className="remediation-priority-badge priority-high">High Priority</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem' }}>Transformer Nodes & Attention</h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>
                        Score: 48%. Video lecture and coding sandbox session recommended.
                      </p>
                    </div>
                  </div>

                  <div className="remediation-rec-card">
                    <span className="remediation-priority-badge priority-medium">Medium Priority</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem' }}>Gradient Descent Optimization</h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>
                        Score: 74%. Revise gradient step learning schedules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">📊 Cognitive Distribution (Bloom's)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Remembering (Mastered)</span>
                    <span>100%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Understanding (Mastered)</span>
                    <span>88%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Applying (Average)</span>
                    <span>77%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Analyzing (Weak)</span>
                    <span>55%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Evaluating (Weak)</span>
                    <span>48%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Creating (Weak)</span>
                    <span>38%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 5: TEACHER AI COPILOT
            ========================================== */}
        {activeView === 'copilot' && (
          <div className={`copilot-panel ${isDyslexicView ? 'dyslexia-font' : ''}`}>
            <div className="ecc-card">
              <h3 className="ecc-card-title">🛠️ Generate Smart Examinations</h3>
              
              <div className="copilot-form-group">
                <label>Subject / Domain</label>
                <input 
                  type="text" 
                  className="copilot-input" 
                  value={copilotSubject} 
                  onChange={(e) => setCopilotSubject(e.target.value)}
                />
              </div>

              <div className="copilot-form-group">
                <label>Topic / Concept focus</label>
                <input 
                  type="text" 
                  className="copilot-input" 
                  value={copilotTopic} 
                  onChange={(e) => setCopilotTopic(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="copilot-form-group">
                  <label>Assessment Mode</label>
                  <select className="copilot-select" value={copilotType} onChange={(e) => setCopilotType(e.target.value)}>
                    <option value="viva">Viva Examination</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="coding">Coding Challenge</option>
                    <option value="practical">Practical Exam Layout</option>
                  </select>
                </div>
                <div className="copilot-form-group">
                  <label>Difficulty</label>
                  <select className="copilot-select" value={copilotDiff} onChange={(e) => setCopilotDiff(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="copilot-form-group">
                <label>Bloom's Taxonomy / HOTS Target</label>
                <select className="copilot-select" value={copilotBloom} onChange={(e) => setCopilotBloom(e.target.value)}>
                  <option>Remembering & Understanding</option>
                  <option>Applying (Practical Application)</option>
                  <option>Analyzing (System breakdowns)</option>
                  <option>Evaluating (Critical judgements)</option>
                  <option>Creating (System Design)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="ecc-btn ecc-btn-primary" onClick={generateCopilotExam}>
                  ✨ Generate Assessment & Keys
                </button>
                <button className="ecc-btn ecc-btn-secondary" onClick={() => setIsDyslexicView(!isDyslexicView)}>
                  ♿ {isDyslexicView ? "Normal Font" : "Dyslexia-Friendly Font"}
                </button>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">📄 Output Panel (Marking Scheme & Rubrics Included)</h3>
              {generatedExamText ? (
                <div className="generated-output-box">
                  {generatedExamText}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', height: '100%', color: 'var(--hub-text-muted)' }}>
                  Configure assessment options and hit generate above to create papers.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 6: INSTITUTION ANALYTICS
            ========================================== */}
        {activeView === 'analytics' && (
          <div className="report-panel">
            <div className="ecc-view-header">
              <div className="ecc-view-title">
                <h2>🏢 Institution Analytics Center</h2>
                <p>High-level administrative metrics monitoring pass rates, dropout risk alerts and readiness index.</p>
              </div>
              <div className="ecc-view-actions">
                <button className="ecc-btn ecc-btn-secondary" onClick={() => triggerDownload('excel')}>
                  📊 Export to Excel
                </button>
                <button className="ecc-btn ecc-btn-secondary" onClick={() => triggerDownload('csv')}>
                  📄 Export CSV
                </button>
                <button className="ecc-btn ecc-btn-secondary" onClick={() => triggerDownload('pdf')}>
                  📥 Export PDF
                </button>
              </div>
            </div>

            <div className="analytics-metric-grid">
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Placement Readiness</span>
                  <div className="analytics-stat-num">88.5%</div>
                </div>
                <span>🎯</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Certification Success</span>
                  <div className="analytics-stat-num">94.2%</div>
                </div>
                <span>🏆</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label font-bold text-red-400">High Dropout Risk</span>
                  <div className="analytics-stat-num text-red-500">3 Students</div>
                </div>
                <span>⚠️</span>
              </div>
              <div className="analytics-stat-card">
                <div>
                  <span className="analytics-stat-label">Average Class Score</span>
                  <div className="analytics-stat-num">82.4%</div>
                </div>
                <span>📈</span>
              </div>
            </div>

            <div className="ecc-grid-2">
              <div className="ecc-card">
                <h3 className="ecc-card-title">🏫 Department Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span>Computer Science & Engineering</span>
                      <span>92% avg</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-primary)', width: '92%', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span>Artificial Intelligence & ML</span>
                      <span>95% avg</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-cyan)', width: '95%', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span>Information Technology</span>
                      <span>84% avg</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', background: 'var(--hub-amber)', width: '84%', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ecc-card">
                <h3 className="ecc-card-title">🔮 Machine Learning Predictions</h3>
                <div className="prediction-item-row">
                  <span>Student Success Probability</span>
                  <strong style={{ color: 'var(--hub-green)' }}>92.4%</strong>
                </div>
                <div className="prediction-item-row">
                  <span>Competitive Exam Success Rate</span>
                  <strong style={{ color: 'var(--hub-cyan)' }}>84.5%</strong>
                </div>
                <div className="prediction-item-row">
                  <span>Average Learning Velocity</span>
                  <strong style={{ color: 'white' }}>1.2x (Fast Learner)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 7: AI PERFORMANCE PREDICTION
            ========================================== */}
        {activeView === 'prediction' && (
          <div className="prediction-box-layout">
            <div className="ecc-card">
              <h3 className="ecc-card-title">🔮 CGPA & Semester Score Prediction</h3>
              
              <div className="prediction-radial-wrap">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--hub-cyan)' }}>8.76</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--hub-text-muted)' }}>Projected CGPA</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#10b981' }}>
                    Confidence Interval: [8.42 - 9.10]
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Final Grade Expected</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>A Grade</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Interview Readiness</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>89% Score</div>
                </div>
              </div>
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">⚡ Explaining Prediction Factors</h3>
              <div className="prediction-factors-list">
                {predictionFactors.map((item, idx) => (
                  <div key={idx} className={`factor-item ${item.type}`}>
                    <span>{item.text}</span>
                    <span>{item.type === 'positive' ? '▲' : '▼'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 8: SMART REMEDIATION HUB
            ========================================== */}
        {activeView === 'remediation' && (
          <div className="remediation-grid">
            <div className="ecc-card">
              <h3 className="ecc-card-title">🩹 Personalized Practice Deck</h3>
              <div className="heatmap-tabs" style={{ marginBottom: '1rem' }}>
                <button className={`heatmap-tab-btn ${remediationTab === 'flashcards' ? 'active' : ''}`} onClick={() => setRemediationTab('flashcards')}>
                  3D Flashcards
                </button>
                <button className={`heatmap-tab-btn ${remediationTab === 'mindmap' ? 'active' : ''}`} onClick={() => setRemediationTab('mindmap')}>
                  Concept Mind Map
                </button>
              </div>

              {remediationTab === 'flashcards' && (
                <div>
                  <div className={`flashcard-wrap ${flashcardFlipped ? 'flipped' : ''}`} onClick={() => setFlashcardFlipped(!flashcardFlipped)}>
                    <div className="flashcard-inner">
                      <div className="flashcard-front">
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '1rem' }}>Front (Concept)</span>
                        <strong>{remediationFlashcards[flashcardIndex].q}</strong>
                        <span style={{ fontSize: '0.7rem', marginTop: '1.5rem', opacity: 0.5 }}>Click to flip and read answer</span>
                      </div>
                      <div className="flashcard-back">
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '1rem' }}>Back (Explanation)</span>
                        <p style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{remediationFlashcards[flashcardIndex].a}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button className="ecc-btn ecc-btn-secondary" onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex(prev => Math.max(0, prev - 1));
                    }} disabled={flashcardIndex === 0}>
                      ← Previous
                    </button>
                    <button className="ecc-btn ecc-btn-secondary" onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex(prev => Math.min(remediationFlashcards.length - 1, prev + 1));
                    }} disabled={flashcardIndex === remediationFlashcards.length - 1}>
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {remediationTab === 'mindmap' && (
                <div className="concept-map-sim">
                  <div className="concept-node" style={{ left: '90px', top: '100px', borderColor: 'var(--hub-primary)', color: 'white', background: 'rgba(139,92,246,0.1)' }}>
                    Deep Learning
                  </div>
                  <div className="concept-node" style={{ left: '10px', top: '30px', borderColor: 'var(--hub-cyan)', color: 'white', background: 'rgba(6,182,212,0.1)' }}>
                    Gradient Descent
                  </div>
                  <div className="concept-node" style={{ left: '170px', top: '40px', borderColor: 'var(--hub-green)', color: 'white', background: 'rgba(16,185,129,0.1)' }}>
                    Regularization
                  </div>
                  <div className="concept-node" style={{ left: '110px', top: '190px', borderColor: 'var(--hub-amber)', color: 'white', background: 'rgba(245,158,11,0.1)' }}>
                    Optimization
                  </div>
                  
                  {/* Simulated connection lines */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                    <line x1="120" y1="100" x2="60" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <line x1="140" y1="100" x2="200" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <line x1="130" y1="125" x2="140" y2="190" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>

            <div className="ecc-card">
              <h3 className="ecc-card-title">📅 Personalized Study Plan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                  <div style={{ color: 'var(--hub-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>Day 1-2</div>
                  <div style={{ fontSize: '0.8rem' }}>Revise L1/L2 Regularization concepts. Finish practice sets.</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                  <div style={{ color: 'var(--hub-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>Day 3</div>
                  <div style={{ fontSize: '0.8rem' }}>Take the adaptive mock test on Deep Learning basics.</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                  <div style={{ color: 'var(--hub-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>Day 4-5</div>
                  <div style={{ fontSize: '0.8rem' }}>Implement simple feedforward layers. Review math matrix sizes.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 9: AI PROCTORING SUPERVISION
            ========================================== */}
        {activeView === 'proctoring' && (
          <div className="proctor-panel">
            <div className="ecc-card">
              <h3 className="ecc-card-title">🛡️ AI Online Exam Supervision</h3>
              
              <div className="proctor-camera-mock" style={{ border: proctorFaceState === 'Red' ? '2px solid #ef4444' : '2px solid #10b981' }}>
                <canvas ref={canvasRef} width="200" height="150" style={{ width: '100%', height: '100%', display: 'block' }} />
                
                <span className={`proctor-status-tag ${proctorFaceState === 'Red' ? 'alert' : 'active'}`}>
                  {proctorFaceState === 'Red' ? "⚠️ ALERT INDIVIDUAL" : "🛡️ SECURITY ONLINE"}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="ecc-btn ecc-btn-secondary" onClick={() => setProctorActive(!proctorActive)}>
                  {proctorActive ? "⏸️ Pause Proctoring" : "▶️ Resume Proctoring"}
                </button>
                <button className="ecc-btn ecc-btn-danger" onClick={() => {
                  setProctorFaceState(p => p === 'Green' ? 'Red' : 'Green');
                }}>
                  Simulate Incident (Alert)
                </button>
              </div>
            </div>

            <div className="ecc-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="ecc-card-title" style={{ margin: 0 }}>📋 Integrity Event Log</h3>
                <span style={{ fontSize: '0.85rem', color: proctorIntegrityScore > 70 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  Integrity Index: {proctorIntegrityScore}%
                </span>
              </div>
              
              <div className="proctor-logs" style={{ marginTop: '1rem', minHeight: '150px' }}>
                {proctorLog.map((log, idx) => (
                  <div key={idx} className={`proctor-log-item ${log.type}`}>
                    <span>[{log.time}]</span>
                    <strong>{log.text}</strong>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem' }}>Configure Supervisor settings:</h4>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  <label>
                    <input type="checkbox" defaultChecked /> Identity checks
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Copy / Paste block
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Tab Blur Alerts
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 10: ADVANCED REPORTING
            ========================================== */}
        {activeView === 'reports' && (
          <div className="report-panel">
            <div className="ecc-view-header" style={{ padding: 0, border: 'none' }}>
              <div className="ecc-view-title">
                <h2>📄 Advanced Reporting Engine</h2>
                <p>Generate download documents customized for Student, Teacher, Parent or Administration views.</p>
              </div>
            </div>

            <div className="report-export-options">
              <div className="export-card" onClick={() => triggerDownload('pdf')}>
                <span className="export-card-icon">📕</span>
                <span className="export-card-label">Student PDF</span>
              </div>
              <div className="export-card" onClick={() => triggerDownload('excel')}>
                <span className="export-card-icon">📊</span>
                <span className="export-card-label">Teacher Excel</span>
              </div>
              <div className="export-card" onClick={() => triggerDownload('csv')}>
                <span className="export-card-icon">📝</span>
                <span className="export-card-label">Parent CSV</span>
              </div>
              <div className="export-card" onClick={() => triggerDownload('pptx')}>
                <span className="export-card-icon">📙</span>
                <span className="export-card-label">Department PPTX</span>
              </div>
              <div className="export-card" onClick={() => triggerDownload('docx')}>
                <span className="export-card-icon">📘</span>
                <span className="export-card-label">Institution DOCX</span>
              </div>
              <div className="export-card" onClick={() => triggerDownload('json')}>
                <span className="export-card-icon">⚙️</span>
                <span className="export-card-label">Raw JSON Data</span>
              </div>
            </div>

            <div className="ecc-card">
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <button className={`heatmap-tab-btn ${reportingRole === 'student' ? 'active' : ''}`} onClick={() => setReportingRole('student')}>
                  Student Report Layout
                </button>
                <button className={`heatmap-tab-btn ${reportingRole === 'teacher' ? 'active' : ''}`} onClick={() => setReportingRole('teacher')}>
                  Instructor Summary Layout
                </button>
                <button className={`heatmap-tab-btn ${reportingRole === 'parent' ? 'active' : ''}`} onClick={() => setReportingRole('parent')}>
                  Parent Dashboard Layout
                </button>
              </div>

              <div className="report-preview-box" style={{ marginTop: '1rem' }}>
                {reportingRole === 'student' && (
                  <div>
                    <h3 style={{ margin: 0 }}>📊 Performance Evaluation: EduStudent99</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-muted)' }}>Class: AI Engineering | Date: July 2026</p>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                      <div>
                        <strong>Overall Subject Grade:</strong> A (87.5/100)
                        <br /><strong>Viva Voice Fluency:</strong> Mastered (92%)
                        <br /><strong>Proctor integrity check:</strong> Clear (100% Score)
                      </div>
                      <div>
                        <strong>Key Weakness identified:</strong> Regularization & Transformers
                        <br /><strong>Remediation study plan status:</strong> Active (Day 1 in progress)
                      </div>
                    </div>
                  </div>
                )}

                {reportingRole === 'teacher' && (
                  <div>
                    <h3 style={{ margin: 0 }}>👨‍🏫 Class Assessment Statistics</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-muted)' }}>Class: AI Engineering Batch B | Instructor: Prof. Davis</p>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                      <div>
                        <strong>Class Pass Rate (Predicted):</strong> 94.2%
                        <br /><strong>Most Ambiguous Question:</strong> "Q3 Case study trade-offs" (42% average review action rate)
                        <br /><strong>Remediation classes scheduled:</strong> 2 classes (Transformers revision)
                      </div>
                      <div>
                        <strong>Average session duration:</strong> 42 minutes
                        <br /><strong>Total incident warnings logged:</strong> 2 incidents flagged globally
                      </div>
                    </div>
                  </div>
                )}

                {reportingRole === 'parent' && (
                  <div>
                    <h3 style={{ margin: 0 }}>👪 Student Progress Report</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--hub-text-muted)' }}>Feedback generated for Parents of: EduStudent99</p>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                    <p style={{ fontSize: '0.8rem', marginTop: '1rem', lineHeight: 1.5 }}>
                      Dear Parent,
                      <br /><br />
                      Your child is making steady progress in the **Machine Learning** course. They achieved a grade of **87.5%** on their recent AI Oral assessment. They show excellent confidence and communication skills (90% rating). 
                      We have put in place a study timeline targeting **Regularization techniques** to help them improve further before the final semester exams.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
