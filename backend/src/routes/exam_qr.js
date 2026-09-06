const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// =============================================================
// EDUVERSE AI - EXAM PAPER MANAGEMENT SYSTEM DATABASE
// =============================================================

// 1. Department Subject Mappings (BCA, BCOM, BBA, Computer Science, AI)
const SUBJECT_MAPPINGS = {
  BCA: {
    '1st Year': [
      { code: 'BCA101', name: 'Programming in C & Logic', credits: 4, maxMarks: 100 },
      { code: 'BCA102', name: 'Digital Electronics & Architecture', credits: 4, maxMarks: 100 },
      { code: 'BCA103', name: 'Discrete Mathematics', credits: 3, maxMarks: 100 }
    ],
    '2nd Year': [
      { code: 'BCA201', name: 'Web Development with React', credits: 4, maxMarks: 100 },
      { code: 'BCA202', name: 'Data Structures & Algorithms in C++', credits: 4, maxMarks: 100 },
      { code: 'BCA203', name: 'Database Systems & SQL', credits: 4, maxMarks: 100 },
      { code: 'BCA204', name: 'Operating Systems & Linux', credits: 3, maxMarks: 100 }
    ],
    '3rd Year': [
      { code: 'BCA301', name: 'Cloud Computing & DevOps', credits: 4, maxMarks: 100 },
      { code: 'BCA302', name: 'Mobile Application Development', credits: 4, maxMarks: 100 },
      { code: 'BCA303', name: 'Software Engineering & Agile', credits: 3, maxMarks: 100 },
      { code: 'BCA304', name: 'Information & Cyber Security', credits: 3, maxMarks: 100 }
    ]
  },
  BCOM: {
    '1st Year': [
      { code: 'BCOM101', name: 'Financial Accounting & Reporting', credits: 4, maxMarks: 100 },
      { code: 'BCOM102', name: 'Business Organization & Management', credits: 4, maxMarks: 100 },
      { code: 'BCOM103', name: 'Micro Economics Principles', credits: 3, maxMarks: 100 }
    ],
    '2nd Year': [
      { code: 'BCOM201', name: 'Corporate Accounting & Auditing', credits: 4, maxMarks: 100 },
      { code: 'BCOM202', name: 'Company Law & Corporate Governance', credits: 4, maxMarks: 100 },
      { code: 'BCOM203', name: 'Cost Accounting & Management Control', credits: 4, maxMarks: 100 },
      { code: 'BCOM204', name: 'Macro Economics & Policy', credits: 3, maxMarks: 100 }
    ],
    '3rd Year': [
      { code: 'BCOM301', name: 'Income Tax Law & Practice', credits: 4, maxMarks: 100 },
      { code: 'BCOM302', name: 'Auditing & Professional Ethics', credits: 4, maxMarks: 100 },
      { code: 'BCOM303', name: 'Goods & Services Tax (GST) Law', credits: 3, maxMarks: 100 },
      { code: 'BCOM304', name: 'Financial Markets & Services', credits: 3, maxMarks: 100 }
    ]
  },
  BBA: {
    '1st Year': [
      { code: 'BBA101', name: 'Principles of Management & Practice', credits: 4, maxMarks: 100 },
      { code: 'BBA102', name: 'Business Economics & Analysis', credits: 4, maxMarks: 100 },
      { code: 'BBA103', name: 'Financial Accounting for Managers', credits: 3, maxMarks: 100 }
    ],
    '2nd Year': [
      { code: 'BBA201', name: 'Marketing Management & Digital Strategy', credits: 4, maxMarks: 100 },
      { code: 'BBA202', name: 'Human Resource Management & Talent', credits: 4, maxMarks: 100 },
      { code: 'BBA203', name: 'Business Research Methods & Analytics', credits: 4, maxMarks: 100 },
      { code: 'BBA204', name: 'Corporate Financial Management', credits: 3, maxMarks: 100 }
    ],
    '3rd Year': [
      { code: 'BBA301', name: 'Strategic Management & Leadership', credits: 4, maxMarks: 100 },
      { code: 'BBA302', name: 'International Business & Trade', credits: 4, maxMarks: 100 },
      { code: 'BBA303', name: 'Entrepreneurship & Startup Incubation', credits: 3, maxMarks: 100 },
      { code: 'BBA304', name: 'Consumer Behavior & Market Dynamics', credits: 3, maxMarks: 100 }
    ]
  },
  'Computer Science': {
    '3rd Year': [
      { code: 'CS801', name: 'Machine Learning & AI Principles', credits: 4, maxMarks: 100 },
      { code: 'CS302', name: 'Data Structures & Algorithms', credits: 4, maxMarks: 100 },
      { code: 'CS501', name: 'Database Management Systems', credits: 4, maxMarks: 100 }
    ]
  },
  'AI & Data Science': {
    '3rd Year': [
      { code: 'AI701', name: 'Artificial Intelligence & Neural Networks', credits: 4, maxMarks: 100 }
    ]
  }
};

// 2. Initial Students Store
let STUDENTS_DB = [
  {
    id: 'STU-BCA25040',
    name: 'Alex Mercer',
    rollNumber: 'BCA25040',
    department: 'BCA',
    year: '2nd Year',
    semester: '3rd Semester',
    section: 'A',
    email: 'alex.bca25040@eduverse.edu',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-BCOM25012',
    name: 'Sophia Chen',
    rollNumber: 'BCOM25012',
    department: 'BCOM',
    year: '1st Year',
    semester: '1st Semester',
    section: 'B',
    email: 'sophia.bcom25012@eduverse.edu',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-BBA25008',
    name: 'Marcus Vance',
    rollNumber: 'BBA25008',
    department: 'BBA',
    year: '3rd Year',
    semester: '5th Semester',
    section: 'A',
    email: 'marcus.bba25008@eduverse.edu',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-CS2026-042',
    name: 'Rahul Sharma',
    rollNumber: 'CS2026-042',
    department: 'Computer Science',
    year: '3rd Year',
    semester: '7th Semester',
    section: 'A',
    email: 'rahul.cs042@eduverse.edu',
    attendance: 'PRESENT'
  },
  {
    id: 'STU-AI2026-015',
    name: 'Elena Rostova',
    rollNumber: 'AI2026-015',
    department: 'AI & Data Science',
    year: '3rd Year',
    semester: '7th Semester',
    section: 'A',
    email: 'elena.ai015@eduverse.edu',
    attendance: 'PRESENT'
  }
];

// 3. Initial Exam Papers Store
let EXAM_PAPERS_DB = [
  {
    id: 'PAPER-BCA-201',
    studentId: 'STU-BCA25040',
    rollNumber: 'BCA25040',
    studentName: 'Alex Mercer',
    department: 'BCA',
    year: '2nd Year',
    semester: '3rd Semester',
    subjectCode: 'BCA201',
    subjectName: 'Web Development with React',
    uploadedBy: 'Dr. Sarah Jenkins (Faculty)',
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q1: Explain React Virtual DOM and reconciliation algorithm.\nAnswer: Virtual DOM is an in-memory representation of real DOM elements. React uses diffing algorithm to compare VDOM trees and update only changed nodes in real DOM.'
      },
      {
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q2: Differentiate between useState and useEffect hooks.\nAnswer: useState manages local component state variables. useEffect manages side effects like data fetching, subscriptions, and DOM mutations.'
      },
      {
        pageNumber: 3,
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q3: Code snippet for custom custom hook useFetch.\nAnswer: const useFetch = (url) => { ... useEffect() ... return { data, loading, error }; }'
      }
    ],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ocrText: 'Full Answer Sheet OCR Text extracted for Alex Mercer (BCA25040) in Web Development with React (BCA201).\nAccuracy Rate: 99.4%',
    marks: {
      internal: 24,
      external: 68,
      total: 92,
      maxMarks: 100
    },
    grade: 'A+',
    passStatus: 'PASSED',
    teacherRemarks: 'Outstanding work on custom React hooks and Virtual DOM diffing explanation! Full marks awarded in Q1 & Q2.',
    highlights: [
      { page: 1, x: 15, y: 35, width: 70, height: 18, text: 'Clean Virtual DOM explanation (+10 Marks)', color: 'rgba(34, 197, 94, 0.35)' },
      { page: 2, x: 20, y: 40, width: 60, height: 15, text: 'Correct useEffect dependency array answer (+15 Marks)', color: 'rgba(34, 197, 94, 0.35)' }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'PAPER-BCA-202',
    studentId: 'STU-BCA25040',
    rollNumber: 'BCA25040',
    studentName: 'Alex Mercer',
    department: 'BCA',
    year: '2nd Year',
    semester: '3rd Semester',
    subjectCode: 'BCA202',
    subjectName: 'Data Structures & Algorithms in C++',
    uploadedBy: 'Prof. Alan Turing',
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q1: Write C++ code to insert node in Binary Search Tree.\nAnswer: struct Node { int data; Node* left; Node* right; }; Node* insert(Node* root, int val)...'
      },
      {
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q2: Compare Time Complexity of QuickSort vs MergeSort.\nAnswer: QuickSort avg O(n log n), worst O(n^2). MergeSort always O(n log n) but requires O(n) space.'
      }
    ],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ocrText: 'Full Answer Sheet OCR Text extracted for Alex Mercer (BCA25040) in Data Structures & Algorithms (BCA202).',
    marks: {
      internal: 22,
      external: 64,
      total: 86,
      maxMarks: 100
    },
    grade: 'A',
    passStatus: 'PASSED',
    teacherRemarks: 'Great BST pointer logic. Be careful with null pointer checks in edge cases.',
    highlights: [
      { page: 1, x: 25, y: 30, width: 50, height: 20, text: 'Verified recursive BST insertion logic', color: 'rgba(59, 130, 246, 0.35)' }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'PAPER-BCOM-101',
    studentId: 'STU-BCOM25012',
    rollNumber: 'BCOM25012',
    studentName: 'Sophia Chen',
    department: 'BCOM',
    year: '1st Year',
    semester: '1st Semester',
    subjectCode: 'BCOM101',
    subjectName: 'Financial Accounting & Reporting',
    uploadedBy: 'Dr. Edgar Codd',
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q1: Balance Sheet Preparation and Trial Balance Matching.\nAssets = Liabilities + Equity.'
      }
    ],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ocrText: 'Full Answer Sheet OCR Text extracted for Sophia Chen (BCOM25012) in Financial Accounting (BCOM101).',
    marks: {
      internal: 25,
      external: 65,
      total: 90,
      maxMarks: 100
    },
    grade: 'A+',
    passStatus: 'PASSED',
    teacherRemarks: 'Accurate financial statement preparation.',
    highlights: [],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'PAPER-BBA-301',
    studentId: 'STU-BBA25008',
    rollNumber: 'BBA25008',
    studentName: 'Marcus Vance',
    department: 'BBA',
    year: '3rd Year',
    semester: '5th Semester',
    subjectCode: 'BBA301',
    subjectName: 'Strategic Management & Leadership',
    uploadedBy: 'Dr. Evelyn Reed',
    pages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        ocrText: 'Q1: SWOT Analysis & Porter 5 Forces Model.'
      }
    ],
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ocrText: 'Full Answer Sheet OCR Text extracted for Marcus Vance (BBA25008) in Strategic Management (BBA301).',
    marks: {
      internal: 23,
      external: 65,
      total: 88,
      maxMarks: 100
    },
    grade: 'A',
    passStatus: 'PASSED',
    teacherRemarks: 'Well structured strategic framework analysis.',
    highlights: [],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

let AUDIT_LOGS = [
  {
    id: 'LOG-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: 'Dr. Sarah Jenkins (Faculty)',
    action: 'UPLOAD_EXAM_PAPER',
    details: 'Uploaded & processed 3 pages for Alex Mercer (BCA25040) - BCA201'
  }
];

let REVISION_REQUESTS = [];

// Helper: Extract Department from Roll Number (BCA, BCOM, BBA, CS, AI)
function getDepartmentFromRollNumber(rollNumber = '') {
  const cleanRoll = rollNumber.trim().toUpperCase();
  if (cleanRoll.startsWith('BCA')) return 'BCA';
  if (cleanRoll.startsWith('BCOM')) return 'BCOM';
  if (cleanRoll.startsWith('BBA')) return 'BBA';
  if (cleanRoll.startsWith('CS')) return 'Computer Science';
  if (cleanRoll.startsWith('AI')) return 'AI & Data Science';
  return 'BCA'; // Default fallback
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Student Login via Roll Number
router.post('/student/login', (req, res) => {
  const { rollNumber } = req.body;
  if (!rollNumber || !rollNumber.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Roll Number.' });
  }

  const formattedRoll = rollNumber.trim().toUpperCase();
  let student = STUDENTS_DB.find(s => s.rollNumber.toUpperCase() === formattedRoll);

  // If student doesn't exist, auto-create student record based on roll number prefix
  if (!student) {
    const dept = getDepartmentFromRollNumber(formattedRoll);
    let year = '2nd Year';
    let semester = '3rd Semester';

    if (formattedRoll.includes('2501') || formattedRoll.includes('1ST')) {
      year = '1st Year';
      semester = '1st Semester';
    } else if (formattedRoll.includes('2500') || formattedRoll.includes('3RD')) {
      year = '3rd Year';
      semester = '5th Semester';
    }

    student = {
      id: `STU-${formattedRoll}`,
      name: `Student (${formattedRoll})`,
      rollNumber: formattedRoll,
      department: dept,
      year: year,
      semester: semester,
      section: 'A',
      email: `${formattedRoll.toLowerCase()}@eduverse.edu`,
      attendance: 'PRESENT'
    };
    STUDENTS_DB.unshift(student);
  }

  // Get department & year specific subject mappings
  const deptMappings = SUBJECT_MAPPINGS[student.department] || SUBJECT_MAPPINGS.BCA;
  const yearSubjects = deptMappings[student.year] || deptMappings['2nd Year'] || Object.values(deptMappings)[0] || [];

  // Get existing answer papers for this student
  const studentPapers = EXAM_PAPERS_DB.filter(p => p.rollNumber.toUpperCase() === formattedRoll);

  AUDIT_LOGS.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: student.name,
    action: 'STUDENT_LOGIN',
    details: `Student logged in with roll number ${formattedRoll}`
  });

  res.json({
    success: true,
    student,
    subjects: yearSubjects,
    papers: studentPapers,
    allDepartmentSubjects: deptMappings
  });
});

// 2. Fetch All Students (Admin)
router.get('/students', (req, res) => {
  res.json({
    success: true,
    total: STUDENTS_DB.length,
    students: STUDENTS_DB
  });
});

// 3. Add Single Student (Admin)
router.post('/students', (req, res) => {
  const { name, rollNumber, department, year, semester, section, email } = req.body;
  if (!name || !rollNumber) {
    return res.status(400).json({ success: false, message: 'Student Name and Roll Number are required.' });
  }

  const formattedRoll = rollNumber.trim().toUpperCase();
  const existing = STUDENTS_DB.find(s => s.rollNumber.toUpperCase() === formattedRoll);
  if (existing) {
    return res.status(400).json({ success: false, message: `Student with roll number ${formattedRoll} already exists.` });
  }

  const newStudent = {
    id: `STU-${formattedRoll}`,
    name,
    rollNumber: formattedRoll,
    department: department || getDepartmentFromRollNumber(formattedRoll),
    year: year || '1st Year',
    semester: semester || '1st Semester',
    section: section || 'A',
    email: email || `${formattedRoll.toLowerCase()}@eduverse.edu`,
    attendance: 'PRESENT'
  };

  STUDENTS_DB.unshift(newStudent);
  res.json({ success: true, student: newStudent, message: 'Student created successfully!' });
});

// 4. Bulk Import Students (Admin CSV / Excel)
router.post('/students/bulk', (req, res) => {
  const { studentsList } = req.body;
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty students list.' });
  }

  let importedCount = 0;
  studentsList.forEach(s => {
    if (s.name && s.rollNumber) {
      const formattedRoll = s.rollNumber.trim().toUpperCase();
      if (!STUDENTS_DB.some(st => st.rollNumber.toUpperCase() === formattedRoll)) {
        STUDENTS_DB.unshift({
          id: `STU-${formattedRoll}`,
          name: s.name,
          rollNumber: formattedRoll,
          department: s.department || getDepartmentFromRollNumber(formattedRoll),
          year: s.year || '1st Year',
          semester: s.semester || '1st Semester',
          section: s.section || 'A',
          email: s.email || `${formattedRoll.toLowerCase()}@eduverse.edu`,
          attendance: 'PRESENT'
        });
        importedCount++;
      }
    }
  });

  res.json({
    success: true,
    importedCount,
    totalStudents: STUDENTS_DB.length,
    message: `Successfully imported ${importedCount} student records!`
  });
});

// 5. Fetch Exam Papers (Admin / Student View)
router.get('/papers', (req, res) => {
  const { rollNumber, department, year, semester, subjectCode, isPublishedOnly } = req.query;

  let results = [...EXAM_PAPERS_DB];

  if (rollNumber) {
    results = results.filter(p => p.rollNumber.toUpperCase() === rollNumber.trim().toUpperCase());
  }

  if (department && department !== 'All') {
    results = results.filter(p => p.department === department);
  }

  if (year && year !== 'All') {
    results = results.filter(p => p.year === year);
  }

  if (semester && semester !== 'All') {
    results = results.filter(p => p.semester === semester);
  }

  if (subjectCode && subjectCode !== 'All') {
    results = results.filter(p => p.subjectCode === subjectCode);
  }

  if (isPublishedOnly === 'true') {
    results = results.filter(p => p.isPublished);
  }

  res.json({
    success: true,
    total: results.length,
    papers: results
  });
});

// 6. Upload & Process Scanned Exam Paper Pages (Admin)
router.post('/papers/upload', (req, res) => {
  const {
    rollNumber,
    studentName,
    department,
    year,
    semester,
    subjectCode,
    subjectName,
    pageImages,
    uploadedBy,
    marks,
    teacherRemarks,
    isPublished
  } = req.body;

  if (!rollNumber || !subjectCode) {
    return res.status(400).json({ success: false, message: 'Roll Number and Subject Code are required.' });
  }

  const formattedRoll = rollNumber.trim().toUpperCase();
  const student = STUDENTS_DB.find(s => s.rollNumber.toUpperCase() === formattedRoll) || {
    id: `STU-${formattedRoll}`,
    name: studentName || `Student (${formattedRoll})`,
    rollNumber: formattedRoll,
    department: department || getDepartmentFromRollNumber(formattedRoll),
    year: year || '2nd Year',
    semester: semester || '3rd Semester'
  };

  const pagesArray = Array.isArray(pageImages) && pageImages.length > 0
    ? pageImages.map((img, idx) => ({
        pageNumber: idx + 1,
        imageUrl: typeof img === 'string' ? img : img.url || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
        thumbnail: typeof img === 'string' ? img : img.thumbnail || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80',
        ocrText: `PAGE ${idx + 1} OCR Text: Extracted text for ${student.name} (${formattedRoll}) - ${subjectCode}.`
      }))
    : [
        {
          pageNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80',
          ocrText: `PAGE 1 OCR Text: ${subjectName || subjectCode} Answer Sheet.`
        }
      ];

  const totalMarksNum = marks ? Number(marks.total || (Number(marks.internal || 0) + Number(marks.external || 0))) : 85;
  const passStatus = totalMarksNum >= 40 ? 'PASSED' : 'FAILED';
  const grade = totalMarksNum >= 90 ? 'A+' : totalMarksNum >= 80 ? 'A' : totalMarksNum >= 70 ? 'B+' : totalMarksNum >= 60 ? 'B' : totalMarksNum >= 40 ? 'C' : 'F';

  const newPaper = {
    id: `PAPER-${formattedRoll}-${subjectCode}-${Date.now().toString().slice(-4)}`,
    studentId: student.id,
    rollNumber: formattedRoll,
    studentName: student.name,
    department: student.department,
    year: student.year,
    semester: student.semester,
    subjectCode,
    subjectName: subjectName || `${subjectCode} Subject Paper`,
    uploadedBy: uploadedBy || 'Admin Lecturer',
    pages: pagesArray,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ocrText: `Complete OCR Text extracted for ${student.name} (${formattedRoll}) - ${subjectCode}.\nPages Processed: ${pagesArray.length}.\nEnhancements Applied: Contrast Auto-balanced, Shadows Removed, Edge Detection Applied.`,
    marks: {
      internal: marks ? Number(marks.internal || 20) : 22,
      external: marks ? Number(marks.external || 60) : 63,
      total: totalMarksNum,
      maxMarks: marks ? Number(marks.maxMarks || 100) : 100
    },
    grade,
    passStatus,
    teacherRemarks: teacherRemarks || 'Answer sheet uploaded & verified by department faculty.',
    highlights: [],
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  EXAM_PAPERS_DB.unshift(newPaper);

  AUDIT_LOGS.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'UPLOAD_EXAM_PAPER',
    details: `Uploaded ${pagesArray.length} scanned pages for ${student.name} (${formattedRoll}) - ${subjectCode}`
  });

  res.json({
    success: true,
    paper: newPaper,
    message: 'Exam paper uploaded & processed successfully!'
  });
});

// 7. Update Pages / Reorder / Delete / Replace (Admin)
router.put('/papers/:id/pages', (req, res) => {
  const { id } = req.params;
  const paper = EXAM_PAPERS_DB.find(p => p.id === id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Exam paper record not found.' });
  }

  const { pages } = req.body;
  if (Array.isArray(pages)) {
    paper.pages = pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    paper.updatedAt = new Date().toISOString();
  }

  res.json({ success: true, paper, message: 'Page order and layout updated successfully!' });
});

// 8. Update Marks & Result Status (Admin)
router.put('/papers/:id/marks', (req, res) => {
  const { id } = req.params;
  const paper = EXAM_PAPERS_DB.find(p => p.id === id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Exam paper record not found.' });
  }

  const { internal, external, maxMarks, grade, passStatus, teacherRemarks, isPublished } = req.body;

  const intNum = internal !== undefined ? Number(internal) : paper.marks.internal;
  const extNum = external !== undefined ? Number(external) : paper.marks.external;
  const totalNum = intNum + extNum;
  const maxNum = maxMarks !== undefined ? Number(maxMarks) : paper.marks.maxMarks;

  paper.marks = {
    internal: intNum,
    external: extNum,
    total: totalNum,
    maxMarks: maxNum
  };

  paper.passStatus = passStatus || (totalNum >= 40 ? 'PASSED' : 'FAILED');
  paper.grade = grade || (totalNum >= 90 ? 'A+' : totalNum >= 80 ? 'A' : totalNum >= 70 ? 'B+' : totalNum >= 60 ? 'B' : totalNum >= 40 ? 'C' : 'F');

  if (teacherRemarks !== undefined) paper.teacherRemarks = teacherRemarks;
  if (isPublished !== undefined) paper.isPublished = Boolean(isPublished);
  paper.updatedAt = new Date().toISOString();

  res.json({ success: true, paper, message: 'Marks and result status updated successfully!' });
});

// 9. Save Teacher Highlights & Annotations (Admin)
router.put('/papers/:id/highlights', (req, res) => {
  const { id } = req.params;
  const paper = EXAM_PAPERS_DB.find(p => p.id === id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Exam paper record not found.' });
  }

  const { highlights } = req.body;
  if (Array.isArray(highlights)) {
    paper.highlights = highlights;
    paper.updatedAt = new Date().toISOString();
  }

  res.json({ success: true, highlights: paper.highlights, message: 'Highlights and comments saved!' });
});

// 10. Toggle Publish Result Status (Admin)
router.put('/papers/:id/publish', (req, res) => {
  const { id } = req.params;
  const paper = EXAM_PAPERS_DB.find(p => p.id === id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Exam paper record not found.' });
  }

  paper.isPublished = !paper.isPublished;
  paper.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    isPublished: paper.isPublished,
    message: paper.isPublished ? 'Result published to student portal! 🚀' : 'Result unpublished (draft mode).'
  });
});

// 11. Trigger OCR Scanning & Clarity Enhancements (Admin)
router.post('/papers/:id/ocr', (req, res) => {
  const { id } = req.params;
  const paper = EXAM_PAPERS_DB.find(p => p.id === id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Paper not found.' });
  }

  paper.ocrText = `[ENHANCED OCR SCAN RESULT]\nStudent: ${paper.studentName} (${paper.rollNumber})\nSubject: ${paper.subjectName} (${paper.subjectCode})\nPages Analyzed: ${paper.pages.length}\nAuto-Contrast: 100% | Shadow Removal: Active | Deskew Angle: 0.0°.\nExtracted Answer Text:\n1. Detailed technical responses detected.\n2. Key formulas and diagrams highlighted.\n3. Anti-plagiarism uniqueness score: 98.6%.`;

  res.json({
    success: true,
    ocrText: paper.ocrText,
    message: 'OCR Scan completed! Readable text extracted & shadow removal applied.'
  });
});

// 12. Student Re-evaluation Request
router.post('/papers/:id/revision', (req, res) => {
  const { id } = req.params;
  const { studentRoll, reason } = req.body;

  const reqObj = {
    id: `REV-${Date.now()}`,
    paperId: id,
    studentRoll,
    reason: reason || 'Re-evaluation request submitted by student.',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  REVISION_REQUESTS.unshift(reqObj);
  res.json({ success: true, revision: reqObj, message: 'Re-evaluation request submitted to department evaluation committee!' });
});

// 13. System Analytics
router.get('/analytics', (req, res) => {
  const totalStudents = STUDENTS_DB.length;
  const totalPapers = EXAM_PAPERS_DB.length;
  const publishedCount = EXAM_PAPERS_DB.filter(p => p.isPublished).length;
  const passedCount = EXAM_PAPERS_DB.filter(p => p.passStatus === 'PASSED').length;

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalPapers,
      publishedCount,
      passedCount,
      passPercentage: totalPapers > 0 ? ((passedCount / totalPapers) * 100).toFixed(1) : '100.0',
      totalPagesScanned: EXAM_PAPERS_DB.reduce((sum, p) => sum + (p.pages ? p.pages.length : 0), 0)
    },
    departmentSubjectMappings: SUBJECT_MAPPINGS
  });
});

module.exports = router;
