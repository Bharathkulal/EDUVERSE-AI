const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-Memory Academic Database Store with Rich Default Mock Data Fallback
let SUBJECTS_DB = [
  {
    id: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    description: 'Supervised learning, deep neural networks, model optimization, and reinforcement learning.',
    icon: '🤖',
    topicsCount: 12,
    materialsCount: 28,
    facultyName: 'Dr. Sarah Jenkins'
  },
  {
    id: 'SUB-102',
    subjectName: 'Data Structures & Algorithms',
    subjectCode: 'CS302',
    department: 'Computer Science',
    semester: '3rd Semester',
    description: 'Arrays, Trees, Graphs, Sorting algorithms, Dynamic Programming, and Complexity Analysis.',
    icon: '🌳',
    topicsCount: 16,
    materialsCount: 34,
    facultyName: 'Prof. Alan Turing'
  },
  {
    id: 'SUB-103',
    subjectName: 'Database Management Systems',
    subjectCode: 'CS501',
    department: 'Computer Science',
    semester: '5th Semester',
    description: 'Relational Model, SQL, Normalization, Transactions, Indexing, and NoSQL databases.',
    icon: '🗄️',
    topicsCount: 10,
    materialsCount: 22,
    facultyName: 'Dr. Edgar Codd'
  },
  {
    id: 'SUB-104',
    subjectName: 'Artificial Intelligence & Neural Networks',
    subjectCode: 'AI701',
    department: 'AI & Data Science',
    semester: '7th Semester',
    description: 'Heuristic Search, Knowledge Representation, Convolutional Networks, Transformers.',
    icon: '🧠',
    topicsCount: 14,
    materialsCount: 31,
    facultyName: 'Dr. Evelyn Reed'
  }
];

let MATERIALS_DB = [
  {
    id: 'MAT-1001',
    title: 'Comprehensive Notes on Backpropagation & Chain Rule',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    topic: 'Deep Neural Networks',
    subtopic: 'Gradient Descent Optimization',
    category: 'Notes', // Notes, Important, Question Bank, Question Paper
    contentType: 'PDF', // PDF, Image, Rich Text, Doc, Link
    description: 'Complete step-by-step mathematical derivation of gradient descent backpropagation with chain rule and code examples.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'ML_Unit3_Backpropagation_Notes.pdf',
    fileSize: '3.4 MB',
    tags: ['Backpropagation', 'Chain Rule', 'Neural Networks', 'Unit 3'],
    unitNumber: 3,
    examYear: '2026',
    difficulty: 'Hard',
    isImportant: true,
    isPinned: true,
    visibility: 'Public', // Public, Branch, Semester, Section
    status: 'Published', // Draft, Published, Archived
    uploadedBy: 'Dr. Sarah Jenkins',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 412,
    downloads: 189,
    saves: 84
  },
  {
    id: 'MAT-1002',
    title: 'Top 15 Must-Study Exam Questions for Machine Learning',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    topic: 'Supervised vs Unsupervised Learning',
    subtopic: 'Exam High Priority Points',
    category: 'Important',
    contentType: 'Rich Text',
    description: 'Curated list of 15 frequently repeated semester exam questions with complete solution formulas and diagrams.',
    fileUrl: '',
    fileName: 'V_IMP_Questions_ML_2026.html',
    fileSize: '450 KB',
    tags: ['Very Important', 'Exam 2026', 'Repeated Questions', 'V.Imp'],
    unitNumber: 1,
    examYear: '2026',
    difficulty: 'Medium',
    isImportant: true,
    isPinned: true,
    visibility: 'Public',
    status: 'Published',
    uploadedBy: 'Dr. Sarah Jenkins',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    views: 650,
    downloads: 310,
    saves: 142
  },
  {
    id: 'MAT-1003',
    title: 'Unit-wise Comprehensive Question Bank (Short & Long Answers)',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    topic: 'Classification & Regression Models',
    subtopic: 'Question Bank Unit 1-5',
    category: 'Question Bank',
    contentType: 'PDF',
    description: 'Unit-wise question bank covering SVM, Decision Trees, KNN, Naive Bayes, L1/L2 Regularization, and Clustering.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'ML_Question_Bank_Units_1_to_5.pdf',
    fileSize: '5.2 MB',
    tags: ['Question Bank', 'Unit 1-5', 'Short Answers', 'Long Answers'],
    unitNumber: 2,
    examYear: '2025',
    difficulty: 'Medium',
    isImportant: false,
    isPinned: false,
    visibility: 'Public',
    status: 'Published',
    uploadedBy: 'Dr. Sarah Jenkins',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    views: 380,
    downloads: 145,
    saves: 56
  },
  {
    id: 'MAT-1004',
    title: 'Previous Semester Question Paper Autumn 2025 (With Answer Key)',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    topic: 'End Semester Examination',
    subtopic: 'Official Question Paper',
    category: 'Question Paper',
    contentType: 'PDF',
    description: 'Official final exam question paper for Autumn 2025 with step-by-step verified answer key solutions.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'ML_End_Sem_Paper_Autumn_2025.pdf',
    fileSize: '4.1 MB',
    tags: ['Previous Paper', 'Autumn 2025', 'Answer Key', 'Official'],
    unitNumber: 5,
    examYear: '2025',
    difficulty: 'Hard',
    isImportant: true,
    isPinned: false,
    visibility: 'Public',
    status: 'Published',
    uploadedBy: 'Dr. Sarah Jenkins',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    views: 890,
    downloads: 520,
    saves: 210
  },
  {
    id: 'MAT-1005',
    title: 'Data Structures: Tree & Graph Traversal Handwritten Notes',
    subjectId: 'SUB-102',
    subjectName: 'Data Structures & Algorithms',
    subjectCode: 'CS302',
    department: 'Computer Science',
    semester: '3rd Semester',
    topic: 'Trees and Binary Search Trees',
    subtopic: 'BFS & DFS Algorithms',
    category: 'Notes',
    contentType: 'PDF',
    description: 'Clean handwritten class notes explaining Inorder, Preorder, Postorder, BFS, and DFS with step-by-step stack diagrams.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'DSA_Tree_Graph_Handwritten_Notes.pdf',
    fileSize: '6.8 MB',
    tags: ['Trees', 'Graphs', 'Handwritten', 'BFS', 'DFS'],
    unitNumber: 3,
    examYear: '2026',
    difficulty: 'Medium',
    isImportant: true,
    isPinned: true,
    visibility: 'Public',
    status: 'Published',
    uploadedBy: 'Prof. Alan Turing',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    views: 740,
    downloads: 390,
    saves: 165
  }
];

let ANNOUNCEMENTS_DB = [
  {
    id: 'ANN-101',
    subjectId: 'SUB-101',
    subjectName: 'Machine Learning',
    title: '📢 End Semester Question Bank & Revision Notes Posted!',
    content: 'All units 1 to 5 revision notes and previous 5 years question papers have been uploaded to the Academic Content Hub. Please review the V.Imp questions before the mid-term test.',
    postedBy: 'Dr. Sarah Jenkins',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

let SAVED_BOOKMARKS = new Set(['MAT-1001', 'MAT-1002']);
let RECENTLY_VIEWED = ['MAT-1001', 'MAT-1005'];
let COMPLETED_MATERIALS = new Set(['MAT-1002']);

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Get All Subjects & Categories Summary
router.get('/subjects', (req, res) => {
  res.json({
    success: true,
    subjects: SUBJECTS_DB
  });
});

// 2. Create/Update Subject
router.post('/subjects', (req, res) => {
  const { subjectName, subjectCode, department, semester, description, icon, facultyName } = req.body;
  if (!subjectName || !department || !semester) {
    return res.status(400).json({ success: false, message: 'Missing required subject parameters' });
  }

  const newSubject = {
    id: `SUB-${Date.now().toString().slice(-4)}`,
    subjectName,
    subjectCode: subjectCode || 'CS101',
    department,
    semester,
    description: description || '',
    icon: icon || '📚',
    topicsCount: 0,
    materialsCount: 0,
    facultyName: facultyName || 'Faculty Member'
  };

  SUBJECTS_DB.unshift(newSubject);
  res.json({ success: true, subject: newSubject });
});

// 3. Search & Fetch Study Materials
router.get('/materials', (req, res) => {
  const {
    query,
    subjectId,
    category, // Notes, Important, Question Bank, Question Paper
    semester,
    department,
    unitNumber,
    isImportantOnly,
    pinnedOnly,
    sortBy // newest, mostViewed, mostDownloaded
  } = req.query;

  let results = [...MATERIALS_DB];

  if (subjectId) {
    results = results.filter(m => m.subjectId === subjectId);
  }

  if (category && category !== 'All') {
    results = results.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  if (semester && semester !== 'All') {
    results = results.filter(m => m.semester === semester);
  }

  if (department && department !== 'All') {
    results = results.filter(m => m.department === department);
  }

  if (unitNumber) {
    results = results.filter(m => String(m.unitNumber) === String(unitNumber));
  }

  if (isImportantOnly === 'true') {
    results = results.filter(m => m.isImportant);
  }

  if (pinnedOnly === 'true') {
    results = results.filter(m => m.isPinned);
  }

  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    results = results.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.subjectName.toLowerCase().includes(q) ||
      m.topic.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy === 'mostViewed') {
    results.sort((a, b) => b.views - a.views);
  } else if (sortBy === 'mostDownloaded') {
    results.sort((a, b) => b.downloads - a.downloads);
  } else {
    // Default newest & pinned top
    results.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    success: true,
    total: results.length,
    materials: results,
    bookmarkedIds: Array.from(SAVED_BOOKMARKS),
    completedIds: Array.from(COMPLETED_MATERIALS)
  });
});

// 4. Upload / Create Study Material (Admin & Lecturer)
router.post('/upload', (req, res) => {
  const {
    title,
    subjectId,
    subjectName,
    subjectCode,
    department,
    semester,
    topic,
    subtopic,
    category,
    contentType,
    description,
    fileUrl,
    fileName,
    fileSize,
    tags,
    unitNumber,
    examYear,
    difficulty,
    isImportant,
    isPinned,
    visibility,
    status,
    uploadedBy
  } = req.body;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: 'Title and Category are required.' });
  }

  const subject = SUBJECTS_DB.find(s => s.id === subjectId || s.subjectName === subjectName) || SUBJECTS_DB[0];

  const newMaterial = {
    id: `MAT-${Date.now().toString().slice(-6)}`,
    title,
    subjectId: subject.id,
    subjectName: subject.subjectName,
    subjectCode: subjectCode || subject.subjectCode,
    department: department || subject.department,
    semester: semester || subject.semester,
    topic: topic || 'General Topic',
    subtopic: subtopic || '',
    category: category || 'Notes',
    contentType: contentType || 'PDF',
    description: description || '',
    fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
    fileSize: fileSize || '2.5 MB',
    tags: Array.isArray(tags) ? tags : ['Study Material', category],
    unitNumber: Number(unitNumber) || 1,
    examYear: examYear || '2026',
    difficulty: difficulty || 'Medium',
    isImportant: Boolean(isImportant),
    isPinned: Boolean(isPinned),
    visibility: visibility || 'Public',
    status: status || 'Published',
    uploadedBy: uploadedBy || 'Lecturer Admin',
    createdAt: new Date().toISOString(),
    views: 0,
    downloads: 0,
    saves: 0
  };

  MATERIALS_DB.unshift(newMaterial);
  subject.materialsCount += 1;

  res.json({
    success: true,
    material: newMaterial,
    message: 'Study material published successfully to Academic Content Hub!'
  });
});

// 5. Update Material Status / Pin / Important
router.put('/materials/:id', (req, res) => {
  const { id } = req.params;
  const material = MATERIALS_DB.find(m => m.id === id);
  if (!material) {
    return res.status(404).json({ success: false, message: 'Material not found' });
  }

  const { isImportant, isPinned, status, title, description } = req.body;
  if (isImportant !== undefined) material.isImportant = isImportant;
  if (isPinned !== undefined) material.isPinned = isPinned;
  if (status !== undefined) material.status = status;
  if (title !== undefined) material.title = title;
  if (description !== undefined) material.description = description;

  res.json({ success: true, material });
});

// 6. Delete Material
router.delete('/materials/:id', (req, res) => {
  const { id } = req.params;
  MATERIALS_DB = MATERIALS_DB.filter(m => m.id !== id);
  res.json({ success: true, message: 'Material deleted' });
});

// 7. Student Interactions: View / Download / Bookmark / Complete
router.post('/materials/:id/view', (req, res) => {
  const { id } = req.params;
  const material = MATERIALS_DB.find(m => m.id === id);
  if (material) {
    material.views += 1;
    if (!RECENTLY_VIEWED.includes(id)) {
      RECENTLY_VIEWED.unshift(id);
    }
  }
  res.json({ success: true, views: material ? material.views : 0 });
});

router.post('/materials/:id/download', (req, res) => {
  const { id } = req.params;
  const material = MATERIALS_DB.find(m => m.id === id);
  if (material) {
    material.downloads += 1;
  }
  res.json({ success: true, downloads: material ? material.downloads : 0 });
});

router.post('/materials/:id/bookmark', (req, res) => {
  const { id } = req.params;
  const material = MATERIALS_DB.find(m => m.id === id);
  let isSaved = false;

  if (SAVED_BOOKMARKS.has(id)) {
    SAVED_BOOKMARKS.delete(id);
    if (material) material.saves = Math.max(0, material.saves - 1);
  } else {
    SAVED_BOOKMARKS.add(id);
    if (material) material.saves += 1;
    isSaved = true;
  }

  res.json({ success: true, isSaved, saves: material ? material.saves : 0 });
});

router.post('/materials/:id/complete', (req, res) => {
  const { id } = req.params;
  let isCompleted = false;

  if (COMPLETED_MATERIALS.has(id)) {
    COMPLETED_MATERIALS.delete(id);
  } else {
    COMPLETED_MATERIALS.add(id);
    isCompleted = true;
  }

  res.json({ success: true, isCompleted });
});

// 8. Analytics & Admin Metrics
router.get('/analytics', (req, res) => {
  const totalNotes = MATERIALS_DB.filter(m => m.category === 'Notes').length;
  const totalImportant = MATERIALS_DB.filter(m => m.category === 'Important').length;
  const totalQuestionBanks = MATERIALS_DB.filter(m => m.category === 'Question Bank').length;
  const totalQuestionPapers = MATERIALS_DB.filter(m => m.category === 'Question Paper').length;
  const totalViews = MATERIALS_DB.reduce((sum, m) => sum + m.views, 0);
  const totalDownloads = MATERIALS_DB.reduce((sum, m) => sum + m.downloads, 0);

  res.json({
    success: true,
    stats: {
      totalSubjects: SUBJECTS_DB.length,
      totalMaterials: MATERIALS_DB.length,
      totalNotes,
      totalImportant,
      totalQuestionBanks,
      totalQuestionPapers,
      totalViews,
      totalDownloads,
      storageUsedMb: (MATERIALS_DB.length * 4.2).toFixed(1)
    },
    topSubjects: SUBJECTS_DB.map(s => ({
      name: s.subjectName,
      code: s.subjectCode,
      materials: MATERIALS_DB.filter(m => m.subjectId === s.id).length,
      views: MATERIALS_DB.filter(m => m.subjectId === s.id).reduce((acc, m) => acc + m.views, 0)
    }))
  });
});

module.exports = router;
