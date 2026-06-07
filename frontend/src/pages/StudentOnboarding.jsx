import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './StudentOnboarding.css';

const STEPS = [
  { num: 1, label: 'Personal', icon: '👤' },
  { num: 2, label: 'Academic', icon: '🎓' },
  { num: 3, label: 'Skills', icon: '⚡' },
  { num: 4, label: 'Level', icon: '🎯' },
];

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function StudentOnboarding() {
  const { user, setProfileCompleted } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.name || '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    course: 'BCA',
    semester: '',
    graduation_year: '',
    college_name: '',
    sslc_marks: '',
    puc_marks: '',
    cgpa: '',
    hobbies: '',
    skills: '',
    favorite_subjects: '',
    career_goal: '',
    learning_level: 'Beginner',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const goNext = () => {
    if (step === 1) {
      if (!form.full_name || !form.age || !form.gender || !form.phone) {
        toast.error('Please fill in all required personal details.');
        return;
      }
    }
    if (step === 2) {
      if (!form.course || !form.semester || !form.graduation_year || !form.college_name || !form.sslc_marks || !form.puc_marks) {
        toast.error('Please fill in all required academic details.');
        return;
      }
    }
    if (step === 3) {
      if (!form.skills || !form.career_goal) {
        toast.error('Please fill in your skills and career goal.');
        return;
      }
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    toast.loading('Analyzing your profile with AI...', { id: 'onboard' });
    try {
      await api.post('/onboarding/submit', {
        ...form,
        age: parseInt(form.age),
        semester: parseInt(form.semester),
        graduation_year: parseInt(form.graduation_year),
        sslc_marks: parseFloat(form.sslc_marks),
        puc_marks: parseFloat(form.puc_marks),
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      });
      setProfileCompleted();
      toast.success('Profile created! AI analysis complete.', { id: 'onboard' });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Onboarding failed. Please try again.', { id: 'onboard' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-orb-1" />
      <div className="onboarding-orb-2" />
      <div className="onboarding-orb-3" />

      <div className="onboarding-card">
        {/* Header */}
        <div className="text-center mb-2">
          <span className="onboarding-brand">EduVerse AI</span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            Complete Your Profile 🎓
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
            Let our AI personalize your learning journey
          </p>
        </div>

        {/* Progress Steps */}
        <div className="onboarding-progress">
          {STEPS.map((s, i) => (
            <div className="onboarding-step-item" key={s.num}>
              <div
                className={`onboarding-step-circle ${
                  step === s.num ? 'active' : step > s.num ? 'completed' : 'inactive'
                }`}
              >
                {step > s.num ? '✓' : s.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`onboarding-step-line ${step > s.num ? 'active' : 'inactive'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="onboarding-step-labels">
          {STEPS.map((s) => (
            <span
              key={s.num}
              className={`onboarding-step-label ${
                step === s.num ? 'active' : step > s.num ? 'completed' : ''
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <div>
                <h2 className="onboarding-step-title">Personal Details</h2>
                <p className="onboarding-step-subtitle">Tell us about yourself</p>
                <div className="onboarding-form-grid">
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Full Name *</label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Age *</label>
                    <input
                      name="age"
                      type="number"
                      min="15"
                      max="60"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="18"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Gender *</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="onboarding-input onboarding-select"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Phone Number *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Address</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="City, State"
                      className="onboarding-input"
                    />
                  </div>
                </div>
                <div className="onboarding-btn-row">
                  <button className="onboarding-btn-next" onClick={goNext} style={{ flex: 1 }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="onboarding-step-title">Academic Details</h2>
                <p className="onboarding-step-subtitle">Your educational background</p>
                <div className="onboarding-form-grid">
                  <div className="onboarding-field">
                    <label className="onboarding-label">Course *</label>
                    <select
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      className="onboarding-input onboarding-select"
                    >
                      <option value="BCA">BCA</option>
                      <option value="BBA">BBA</option>
                      <option value="BCom">BCom</option>
                    </select>
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Current Semester *</label>
                    <select
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="onboarding-input onboarding-select"
                    >
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">Graduation Year *</label>
                    <select
                      name="graduation_year"
                      value={form.graduation_year}
                      onChange={handleChange}
                      className="onboarding-input onboarding-select"
                    >
                      <option value="">Select</option>
                      {[2024,2025,2026,2027,2028,2029,2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">College Name *</label>
                    <input
                      name="college_name"
                      value={form.college_name}
                      onChange={handleChange}
                      placeholder="Your college name"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">SSLC Percentage *</label>
                    <input
                      name="sslc_marks"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.sslc_marks}
                      onChange={handleChange}
                      placeholder="85.50"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label className="onboarding-label">2nd PUC Percentage *</label>
                    <input
                      name="puc_marks"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.puc_marks}
                      onChange={handleChange}
                      placeholder="78.00"
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Current CGPA (Optional)</label>
                    <input
                      name="cgpa"
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={form.cgpa}
                      onChange={handleChange}
                      placeholder="8.5"
                      className="onboarding-input"
                    />
                  </div>
                </div>
                <div className="onboarding-btn-row">
                  <button className="onboarding-btn-back" onClick={goBack}>← Back</button>
                  <button className="onboarding-btn-next" onClick={goNext}>Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="onboarding-step-title">Skills & Interests</h2>
                <p className="onboarding-step-subtitle">What drives your passion?</p>
                <div className="onboarding-form-grid">
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Hobbies</label>
                    <input
                      name="hobbies"
                      value={form.hobbies}
                      onChange={handleChange}
                      placeholder="Reading, Gaming, Sports..."
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Technical Skills *</label>
                    <textarea
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="Python, JavaScript, SQL, React, HTML/CSS..."
                      className="onboarding-input onboarding-textarea"
                    />
                  </div>
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Favorite Subjects</label>
                    <input
                      name="favorite_subjects"
                      value={form.favorite_subjects}
                      onChange={handleChange}
                      placeholder="Data Structures, Database, Machine Learning..."
                      className="onboarding-input"
                    />
                  </div>
                  <div className="onboarding-field full-width">
                    <label className="onboarding-label">Career Goal *</label>
                    <textarea
                      name="career_goal"
                      value={form.career_goal}
                      onChange={handleChange}
                      placeholder="I want to become a Full Stack Developer and work at a top tech company..."
                      className="onboarding-input onboarding-textarea"
                    />
                  </div>
                </div>
                <div className="onboarding-btn-row">
                  <button className="onboarding-btn-back" onClick={goBack}>← Back</button>
                  <button className="onboarding-btn-next" onClick={goNext}>Continue →</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="onboarding-step-title">Learning Preference</h2>
                <p className="onboarding-step-subtitle">Choose your current skill level</p>
                <div className="learning-level-grid">
                  {[
                    { val: 'Beginner', icon: '🌱', title: 'Beginner', desc: 'Just starting out, eager to learn fundamentals' },
                    { val: 'Intermediate', icon: '🚀', title: 'Intermediate', desc: 'Have basic knowledge, ready for deeper concepts' },
                    { val: 'Advanced', icon: '💎', title: 'Advanced', desc: 'Strong foundation, looking for specialization' },
                  ].map((lvl) => (
                    <div
                      key={lvl.val}
                      className={`learning-level-card ${form.learning_level === lvl.val ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, learning_level: lvl.val })}
                    >
                      <span className="learning-level-icon">{lvl.icon}</span>
                      <div className="learning-level-title">{lvl.title}</div>
                      <div className="learning-level-desc">{lvl.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(52, 211, 153, 0.05)',
                  border: '1px solid rgba(52, 211, 153, 0.15)',
                }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    Profile Summary
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                    <span>📛 {form.full_name || '—'}</span>
                    <span>🎓 {form.course} — Sem {form.semester || '—'}</span>
                    <span>🏫 {form.college_name || '—'}</span>
                    <span>🎯 {form.learning_level}</span>
                  </div>
                </div>

                <div className="onboarding-btn-row" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    className="onboarding-btn-submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span className="onboarding-spinner" />
                        Analyzing with AI...
                      </span>
                    ) : (
                      '🚀 Submit & Generate AI Analysis'
                    )}
                  </button>
                  <button className="onboarding-btn-back" onClick={goBack} style={{ flex: 'none' }}>
                    ← Back to Skills
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
