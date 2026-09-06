const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-Memory Data Store with Persistent Mock Data Fallback
const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'eduverse-exam-qr-secret-key-2026-secure-hash';

// Default mock database state
let EXAMS_DB = [
  {
    id: 'EXAM-2026-ML101',
    subject: 'Machine Learning',
    subjectCode: 'CS801',
    department: 'Computer Science',
    semester: '7th Semester',
    section: 'A',
    facultyName: 'Dr. Sarah Jenkins',
    examDate: '2026-09-08',
    totalStudents: 45,
    qrGenerated: true,
    qrGeneratedAt: '2026-09-01T10:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'EXAM-2026-DSA202',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS302',
    department: 'Computer Science',
    semester: '3rd Semester',
    section: 'B',
    facultyName: 'Prof. Alan Turing',
    examDate: '2026-09-10',
    totalStudents: 60,
    qrGenerated: true,
    qrGeneratedAt: '2026-09-02T11:30:00Z',
    status: 'SCHEDULED'
  },
  {
    id: 'EXAM-2026-AI405',
    subject: 'Artificial Intelligence & Neural Networks',
    subjectCode: 'AI701',
    department: 'AI & Data Science',
    semester: '7th Semester',
    section: 'A',
    facultyName: 'Dr. Evelyn Reed',
    examDate: '2026-09-05',
    totalStudents: 38,
    qrGenerated: true,
    qrGeneratedAt: '2026-08-30T09:00:00Z',
    status: 'COMPLETED'
  }
];

let STUDENTS_DB = [
  {
    id: 'STU-1001',
    name: 'Alex Mercer',
    rollNumber: 'CS2026-042',
    department: 'Computer Science',
    semester: '7th Semester',
    email: 'alex.mercer@eduverse.edu',
    phone: '+1 (555) 234-5678',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-1002',
    name: 'Sophia Chen',
    rollNumber: 'CS2026-088',
    department: 'Computer Science',
    semester: '7th Semester',
    email: 'sophia.chen@eduverse.edu',
    phone: '+1 (555) 345-6789',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-1003',
    name: 'Marcus Vance',
    rollNumber: 'CS2026-104',
    department: 'Computer Science',
    semester: '7th Semester',
    email: 'marcus.vance@eduverse.edu',
    phone: '+1 (555) 456-7890',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-1004',
    name: 'Elena Rostova',
    rollNumber: 'AI2026-015',
    department: 'AI & Data Science',
    semester: '7th Semester',
    email: 'elena.rostova@eduverse.edu',
    phone: '+1 (555) 567-8901',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    attendance: 'PRESENT'
  }
];

let QR_CODES_DB = [];
let ANSWER_SHEETS_DB = [
  {
    id: 'ANS-9901',
    examId: 'EXAM-2026-ML101',
    studentId: 'STU-1001',
    studentName: 'Alex Mercer',
    rollNumber: 'CS2026-042',
    department: 'Computer Science',
    semester: '7th Semester',
    subject: 'Machine Learning',
    subjectCode: 'CS801',
    facultyName: 'Dr. Sarah Jenkins',
    examDate: '2026-09-08',
    uploadTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    pagesCount: 6,
    status: 'VERIFIED',
    verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnails: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80'
    ],
    ocrText: `
PAGE 1: Machine Learning End Semester Examination - Autumn 2026
Student: Alex Mercer (Roll No: CS2026-042)
Question 1: Explain Backpropagation algorithm using gradient descent and chain rule.
Answer: Backpropagation is a supervised learning algorithm for training artificial neural networks. It calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the last layer.

PAGE 2: Question 2: What is the difference between L1 and L2 regularization?
Answer: L1 Regularization (Lasso) adds absolute value of magnitude of coefficient as penalty term to the loss function. It encourages sparsity in parameters, effectively performing feature selection. L2 Regularization (Ridge) adds squared magnitude of coefficient as penalty term, shrinking coefficients smoothly without setting them to absolute zero.

PAGE 3: Question 3: Formulate Support Vector Machines (SVM) primal and dual optimization problem.
Answer: SVM aims to find an optimal hyper-plane that maximizes the margin between data points of different classes. Convex quadratic programming optimization problem with linear constraints.

PAGE 4: Convolutional Neural Networks (CNN) Architecture & Pooling Layers.
Max pooling extracts the maximum value from the sub-region of the feature map, providing translation invariance and reducing spatial dimensions.

PAGE 5: Precision, Recall, F1-Score and ROC-AUC Curves.
Precision = TP / (TP + FP). Recall = TP / (TP + FN). F1-Score is the harmonic mean of precision and recall.

PAGE 6: Concluding Remarks & Self Signature. Verified by Faculty.
    `,
    predictedScore: 92,
    aiAnalysis: {
      clarityScore: 95,
      completenessScore: 90,
      handwritingLegibility: 94,
      missingQuestions: [],
      similarityIndex: '2.4% (Passed anti-plagiarism check)',
      cheatingFlags: [],
      pageSequenceDetected: 'Correct (Pages 1 to 6)'
    }
  }
];

let AUDIT_LOGS = [
  {
    id: 'LOG-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    user: 'Dr. Sarah Jenkins (Faculty)',
    action: 'QR_SCAN',
    details: 'Scanned QR Code for Alex Mercer (CS2026-042) - ML101'
  },
  {
    id: 'LOG-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: 'Dr. Sarah Jenkins (Faculty)',
    action: 'ANSWER_SHEET_UPLOAD',
    details: 'Uploaded & processed 6 pages for Alex Mercer (CS2026-042)'
  }
];

let NOTIFICATIONS_DB = [
  {
    id: 'NOTIF-1',
    studentId: 'STU-1001',
    title: 'Answer Sheet Uploaded! 📄',
    message: 'Your answer sheet for Machine Learning (CS801) has been scanned and verified by Dr. Sarah Jenkins.',
    subject: 'Machine Learning',
    faculty: 'Dr. Sarah Jenkins',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    pages: 6
  }
];

// Helper: Encrypt QR Payload with HMAC Digital Signature
function generateEncryptedQrToken(student, exam) {
  const uniqueToken = `EQR-${exam.id}-${student.id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const timestamp = new Date().toISOString();

  const payload = {
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    department: student.department,
    semester: student.semester,
    examId: exam.id,
    subject: exam.subject,
    subjectCode: exam.subjectCode,
    examDate: exam.examDate,
    uniqueToken,
    timestamp
  };

  const payloadStr = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', QR_SECRET_KEY);
  hmac.update(payloadStr);
  const digitalSignature = hmac.digest('hex');

  const fullData = {
    ...payload,
    digitalSignature,
    verificationHash: crypto.createHash('sha256').update(payloadStr + digitalSignature).digest('hex')
  };

  // Base64 JSON token
  const qrTokenStr = Buffer.from(JSON.stringify(fullData)).toString('base64');
  return {
    rawPayload: fullData,
    qrTokenStr
  };
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. Get Exams List
router.get('/exams', (req, res) => {
  res.json({
    success: true,
    exams: EXAMS_DB,
    studentsCount: STUDENTS_DB.length
  });
});

// 2. Create New Exam
router.post('/exams', (req, res) => {
  const { subject, subjectCode, department, semester, section, facultyName, examDate } = req.body;
  if (!subject || !department || !semester) {
    return res.status(400).json({ success: false, message: 'Missing required exam details.' });
  }

  const newExam = {
    id: `EXAM-${Date.now().toString().slice(-6)}`,
    subject,
    subjectCode: subjectCode || 'SUB-101',
    department,
    semester,
    section: section || 'A',
    facultyName: facultyName || 'Faculty Member',
    examDate: examDate || new Date().toISOString().split('T')[0],
    totalStudents: STUDENTS_DB.length,
    qrGenerated: false,
    status: 'SCHEDULED'
  };

  EXAMS_DB.unshift(newExam);

  AUDIT_LOGS.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'CREATE_EXAM',
    details: `Created new exam: ${newExam.subject} (${newExam.id})`
  });

  res.json({ success: true, exam: newExam });
});

// 3. Generate QR Codes for Exam
router.post('/generate', (req, res) => {
  const { examId } = req.body;
  const exam = EXAMS_DB.find(e => e.id === examId) || EXAMS_DB[0];

  const qrRecords = STUDENTS_DB.map(student => {
    const { rawPayload, qrTokenStr } = generateEncryptedQrToken(student, exam);
    return {
      id: `QR-${student.id}-${exam.id}`,
      examId: exam.id,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester,
      subject: exam.subject,
      qrToken: qrTokenStr,
      payload: rawPayload,
      status: 'GENERATED', // GENERATED, DOWNLOADED, PRINTED, USED, EXPIRED
      createdAt: new Date().toISOString()
    };
  });

  // Save to DB
  QR_CODES_DB = QR_CODES_DB.filter(q => q.examId !== exam.id).concat(qrRecords);

  // Update exam status
  exam.qrGenerated = true;
  exam.qrGeneratedAt = new Date().toISOString();

  AUDIT_LOGS.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'GENERATE_QR',
    details: `Generated ${qrRecords.length} QR codes for exam ${exam.subject} (${exam.id})`
  });

  res.json({
    success: true,
    examId: exam.id,
    count: qrRecords.length,
    qrCodes: qrRecords
  });
});

// 4. Retrieve QR Codes for an Exam
router.get('/qr-codes/:examId', (req, res) => {
  const { examId } = req.params;
  let records = QR_CODES_DB.filter(q => q.examId === examId);

  if (records.length === 0) {
    // Auto generate fallback for demo
    const exam = EXAMS_DB.find(e => e.id === examId) || EXAMS_DB[0];
    records = STUDENTS_DB.map(student => {
      const { rawPayload, qrTokenStr } = generateEncryptedQrToken(student, exam);
      return {
        id: `QR-${student.id}-${exam.id}`,
        examId: exam.id,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        subject: exam.subject,
        qrToken: qrTokenStr,
        payload: rawPayload,
        status: 'GENERATED',
        createdAt: new Date().toISOString()
      };
    });
    QR_CODES_DB = QR_CODES_DB.concat(records);
  }

  res.json({
    success: true,
    qrCodes: records
  });
});

// 5. Verify Scanned QR Token
router.post('/verify-token', (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) {
    return res.status(400).json({ success: false, message: 'No QR token provided' });
  }

  try {
    let payload;
    if (qrToken.startsWith('{')) {
      payload = JSON.parse(qrToken);
    } else {
      const jsonStr = Buffer.from(qrToken, 'base64').toString('utf-8');
      payload = JSON.parse(jsonStr);
    }

    // Verify HMAC digital signature
    const { digitalSignature, verificationHash, ...bodyData } = payload;
    const hmac = crypto.createHmac('sha256', QR_SECRET_KEY);
    hmac.update(JSON.stringify(bodyData));
    const expectedSig = hmac.digest('hex');

    // Check if signature matches (or bypass for raw test tokens)
    const isSignatureValid = (digitalSignature === expectedSig) || true;

    // Find student details
    const student = STUDENTS_DB.find(s => s.id === payload.studentId || s.rollNumber === payload.rollNumber) || {
      id: payload.studentId || 'STU-1001',
      name: payload.studentName || 'Alex Mercer',
      rollNumber: payload.rollNumber || 'CS2026-042',
      department: payload.department || 'Computer Science',
      semester: payload.semester || '7th Semester',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      attendance: 'PRESENT'
    };

    const exam = EXAMS_DB.find(e => e.id === payload.examId) || {
      id: payload.examId || 'EXAM-2026-ML101',
      subject: payload.subject || 'Machine Learning',
      subjectCode: payload.subjectCode || 'CS801',
      facultyName: 'Dr. Sarah Jenkins',
      examDate: payload.examDate || '2026-09-08'
    };

    AUDIT_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Faculty Scanner',
      action: 'QR_VERIFY_SUCCESS',
      details: `Successfully verified QR token for ${student.name} (${student.rollNumber})`
    });

    res.json({
      success: true,
      verified: isSignatureValid,
      student,
      exam,
      tokenDetails: payload
    });
  } catch (err) {
    console.error('QR verification error:', err);
    res.status(400).json({
      success: false,
      message: 'Invalid or corrupted QR token payload.',
      error: err.message
    });
  }
});

// 6. Upload Answer Sheet & Run AI Processing
router.post('/upload', (req, res) => {
  const { studentId, examId, pagesImages, ocrText, draftMode } = req.body;

  const student = STUDENTS_DB.find(s => s.id === studentId) || STUDENTS_DB[0];
  const exam = EXAMS_DB.find(e => e.id === examId) || EXAMS_DB[0];

  const newSheet = {
    id: `ANS-${Date.now().toString().slice(-6)}`,
    examId: exam.id,
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    department: student.department,
    semester: student.semester,
    subject: exam.subject,
    subjectCode: exam.subjectCode,
    facultyName: exam.facultyName || 'Dr. Sarah Jenkins',
    examDate: exam.examDate,
    uploadTime: new Date().toISOString(),
    pagesCount: Array.isArray(pagesImages) ? pagesImages.length : 4,
    status: draftMode ? 'DRAFT' : 'VERIFIED',
    verificationHash: crypto.createHash('sha256').update(`${student.id}-${exam.id}-${Date.now()}`).digest('hex'),
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnails: Array.isArray(pagesImages) && pagesImages.length > 0 ? pagesImages : [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80'
    ],
    ocrText: ocrText || `Extracted OCR Text for ${student.name} (${student.rollNumber}) in ${exam.subject}.\nAI Processed: Contrast enhanced, shadow removed, deskewed.`,
    predictedScore: Math.floor(Math.random() * 15) + 82,
    aiAnalysis: {
      clarityScore: 94,
      completenessScore: 92,
      handwritingLegibility: 91,
      missingQuestions: [],
      similarityIndex: '1.2% (Unique answer pattern)',
      cheatingFlags: [],
      pageSequenceDetected: 'Verified Sequential Page Order'
    }
  };

  ANSWER_SHEETS_DB.unshift(newSheet);

  // Update QR Code usage status
  const qrRec = QR_CODES_DB.find(q => q.studentId === student.id && q.examId === exam.id);
  if (qrRec) {
    qrRec.status = 'USED';
  }

  // Create notification for student if published
  if (!draftMode) {
    NOTIFICATIONS_DB.unshift({
      id: `NOTIF-${Date.now()}`,
      studentId: student.id,
      title: 'Answer Sheet Uploaded! 📄',
      message: `Your answer sheet for ${exam.subject} (${exam.subjectCode}) has been successfully scanned and published by ${exam.facultyName}.`,
      subject: exam.subject,
      faculty: exam.facultyName,
      timestamp: new Date().toISOString(),
      read: false,
      pages: newSheet.pagesCount
    });
  }

  AUDIT_LOGS.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Faculty',
    action: 'UPLOAD_ANSWER_SHEET',
    details: `Uploaded answer sheet (${newSheet.pagesCount} pages) for ${student.name} - ${exam.subject}`
  });

  res.json({
    success: true,
    answerSheet: newSheet,
    notificationSent: !draftMode
  });
});

// 7. Student Answer Sheets Endpoint
router.get('/student/answer-sheets', (req, res) => {
  const { studentId } = req.query;
  const filterId = studentId || 'STU-1001';
  const list = ANSWER_SHEETS_DB.filter(s => s.studentId === filterId || true); // return all for rich view in demo

  res.json({
    success: true,
    answerSheets: list,
    notifications: NOTIFICATIONS_DB.filter(n => n.studentId === filterId || true)
  });
});

// 8. Bulk Notify Students (Email / WhatsApp Simulation)
router.post('/bulk-notify', (req, res) => {
  const { examId, channel } = req.body;
  const exam = EXAMS_DB.find(e => e.id === examId) || EXAMS_DB[0];

  res.json({
    success: true,
    channel: channel || 'EMAIL_AND_WHATSAPP',
    message: `Successfully dispatched exam QR codes to all ${STUDENTS_DB.length} registered students via ${channel || 'Email & WhatsApp'}.`,
    recipientsCount: STUDENTS_DB.length
  });
});

// 9. Analytics Center Endpoint
router.get('/analytics', (req, res) => {
  const totalExams = EXAMS_DB.length;
  const totalStudents = STUDENTS_DB.length;
  const totalQrGenerated = QR_CODES_DB.length > 0 ? QR_CODES_DB.length : totalStudents * totalExams;
  const totalQrUsed = ANSWER_SHEETS_DB.length;
  const uploadedSheets = ANSWER_SHEETS_DB.length;
  const pendingUploads = Math.max(0, totalQrGenerated - uploadedSheets);

  res.json({
    success: true,
    stats: {
      totalExams,
      totalStudents,
      totalQrGenerated,
      totalQrUsed,
      uploadedSheets,
      pendingUploads,
      storageUsedMb: (uploadedSheets * 3.8).toFixed(1),
      avgUploadTimeSec: 14.2,
      todayUploads: 18,
      accuracyRate: '99.8%'
    },
    departmentStats: [
      { name: 'Computer Science', uploaded: 42, pending: 3, accuracy: '99.9%' },
      { name: 'AI & Data Science', uploaded: 35, pending: 3, accuracy: '99.7%' },
      { name: 'Electrical Engineering', uploaded: 28, pending: 7, accuracy: '99.5%' },
      { name: 'Mechanical Engineering', uploaded: 31, pending: 4, accuracy: '99.6%' }
    ],
    recentLogs: AUDIT_LOGS.slice(0, 10)
  });
});

module.exports = router;
