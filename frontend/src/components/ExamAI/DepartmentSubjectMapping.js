// Helper utilities and department-wise subject mapping logic for EduVerse AI Exam Paper System

export const DEPARTMENT_SUBJECT_MAPPINGS = {
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

export function resolveDepartmentFromRollNumber(rollNumber = '') {
  const clean = rollNumber.trim().toUpperCase();
  if (clean.startsWith('BCA')) return 'BCA';
  if (clean.startsWith('BCOM')) return 'BCOM';
  if (clean.startsWith('BBA')) return 'BBA';
  if (clean.startsWith('CS')) return 'Computer Science';
  if (clean.startsWith('AI')) return 'AI & Data Science';
  return 'BCA';
}

export function getSubjectsForStudent(department, year = '2nd Year') {
  const deptObj = DEPARTMENT_SUBJECT_MAPPINGS[department] || DEPARTMENT_SUBJECT_MAPPINGS.BCA;
  return deptObj[year] || deptObj['2nd Year'] || Object.values(deptObj)[0] || [];
}
