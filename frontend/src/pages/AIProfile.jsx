import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './AIProfile.css';

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function AIProfile() {
  const [profile, setProfile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/onboarding/profile').catch(() => ({ data: null })),
      api.get('/onboarding/predictions').catch(() => ({ data: null })),
    ]).then(([profileRes, predRes]) => {
      setProfile(profileRes.data);
      setPredictions(predRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-20 rounded-xl" style={{ background: 'var(--db-inner-card)' }} />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl" style={{ background: 'var(--db-inner-card)' }} />)}
        </div>
      </div>
    );
  }

  if (!profile || !predictions) {
    return (
      <div className="ai-no-data">
        <div className="ai-no-data-icon">🧠</div>
        <div className="ai-no-data-title">No AI Profile Found</div>
        <div className="ai-no-data-desc">Complete your onboarding to generate AI analysis.</div>
      </div>
    );
  }

  const strengths = Array.isArray(predictions.strengths) ? predictions.strengths : [];
  const weaknesses = Array.isArray(predictions.weaknesses) ? predictions.weaknesses : [];
  const careers = Array.isArray(predictions.career_recommendations) ? predictions.career_recommendations : [];
  const roadmap = Array.isArray(predictions.roadmap) ? predictions.roadmap : [];
  const perfScore = parseFloat(predictions.performance_score) || 0;
  const placeScore = parseFloat(predictions.placement_score) || 0;

  const careerIcons = ['💻', '📊', '🤖', '🌐', '☁️', '⚙️', '📈', '👔', '🏦', '📋', '🎯', '💼'];

  return (
    <div>
      {/* Header */}
      <div className="ai-profile-header">
        <h1>🧠 AI Profile Analysis</h1>
        <p>Your personalized AI-powered learning insights</p>
      </div>

      {/* Row 1: AI Profile + Learning Type + Performance */}
      <div className="ai-cards-grid">
        {/* AI Profile Card */}
        <motion.div
          className="ai-glass-card accent-emerald"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon emerald">👤</div>
            <span className="ai-card-title">AI Profile</span>
          </div>
          <div className="ai-profile-info-grid">
            <div className="ai-profile-info-item">
              <span className="ai-profile-info-label">Name</span>
              <span className="ai-profile-info-value">{profile.full_name}</span>
            </div>
            <div className="ai-profile-info-item">
              <span className="ai-profile-info-label">Course</span>
              <span className="ai-profile-info-value">{profile.course} — Sem {profile.semester}</span>
            </div>
            <div className="ai-profile-info-item">
              <span className="ai-profile-info-label">College</span>
              <span className="ai-profile-info-value">{profile.college_name}</span>
            </div>
            <div className="ai-profile-info-item">
              <span className="ai-profile-info-label">Level</span>
              <span className="ai-profile-info-value">{profile.learning_level}</span>
            </div>
          </div>
        </motion.div>

        {/* Learning Type Card */}
        <motion.div
          className="ai-glass-card accent-purple"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon purple">🎯</div>
            <span className="ai-card-title">Learning Type</span>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {predictions.learning_type?.includes('Analytical') ? '🔬' :
               predictions.learning_type?.includes('Practical') ? '🛠️' :
               predictions.learning_type?.includes('Visual') ? '🎨' : '🏃'}
            </div>
            <div className="ai-learning-type-badge">
              {predictions.learning_type}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--db-text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              {predictions.learning_type?.includes('Analytical')
                ? 'You excel at logical reasoning and data-driven problem solving.'
                : predictions.learning_type?.includes('Practical')
                ? 'You learn best through hands-on experience and building projects.'
                : predictions.learning_type?.includes('Visual')
                ? 'You thrive with visual aids, diagrams, and design-oriented learning.'
                : 'You learn effectively through physical activities and experimentation.'}
            </p>
          </div>
        </motion.div>

        {/* Performance Prediction Card */}
        <motion.div
          className="ai-glass-card accent-blue"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon blue">📈</div>
            <span className="ai-card-title">Performance Prediction</span>
          </div>
          <div
            className="ai-score-circle emerald"
            style={{ '--score': perfScore }}
          >
            <div className="ai-score-inner">
              <span className="ai-score-value">{perfScore}%</span>
              <span className="ai-score-label">Score</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--db-text-muted)', marginTop: '0.5rem' }}>
            Academic Performance Probability
          </p>
        </motion.div>
      </div>

      {/* Row 2: Placement + Strengths/Weaknesses */}
      <div className="ai-cards-grid-2">
        {/* Placement Readiness */}
        <motion.div
          className="ai-glass-card accent-cyan"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon cyan">🏆</div>
            <span className="ai-card-title">Placement Readiness</span>
          </div>
          <div
            className="ai-score-circle blue"
            style={{ '--score': placeScore }}
          >
            <div className="ai-score-inner">
              <span className="ai-score-value">{placeScore}%</span>
              <span className="ai-score-label">Ready</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--db-text-muted)', marginTop: '0.5rem' }}>
            {placeScore >= 80 ? 'Excellent! You are highly placement ready.' :
             placeScore >= 60 ? 'Good progress! Focus on building more skills.' :
             'Keep improving your skills to enhance readiness.'}
          </p>
        </motion.div>

        {/* Strengths & Weaknesses Analytics */}
        <motion.div
          className="ai-glass-card accent-amber"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon amber">⚡</div>
            <span className="ai-card-title">Strengths & Weaknesses</span>
          </div>

          {strengths.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Strengths
              </p>
              <div className="ai-bar-chart">
                {strengths.map((s, i) => (
                  <div className="ai-bar-item" key={i}>
                    <span className="ai-bar-label">{s}</span>
                    <div className="ai-bar-track">
                      <motion.div
                        className="ai-bar-fill emerald"
                        initial={{ width: 0 }}
                        animate={{ width: `${90 - i * 10}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Areas to Improve
              </p>
              <div className="ai-bar-chart">
                {weaknesses.map((w, i) => (
                  <div className="ai-bar-item" key={i}>
                    <span className="ai-bar-label">{w}</span>
                    <div className="ai-bar-track">
                      <motion.div
                        className="ai-bar-fill rose"
                        initial={{ width: 0 }}
                        animate={{ width: `${60 - i * 10}%` }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 3: Career Recommendations + Learning Roadmap */}
      <div className="ai-cards-grid-2">
        {/* Career Recommendation */}
        <motion.div
          className="ai-glass-card accent-rose"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon rose">💼</div>
            <span className="ai-card-title">Career Recommendations</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--db-text-muted)', marginBottom: '0.75rem' }}>
            Based on your {profile.course} profile and skills
          </p>
          <div className="ai-tag-list">
            {careers.map((career, i) => (
              <span className="ai-tag career" key={i}>
                {careerIcons[i % careerIcons.length]} {career}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Personalized Learning Roadmap */}
        <motion.div
          className="ai-glass-card accent-emerald"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
        >
          <div className="ai-card-header">
            <div className="ai-card-icon emerald">🗺️</div>
            <span className="ai-card-title">Personalized Learning Roadmap</span>
          </div>
          <div className="ai-roadmap-list">
            {roadmap.map((phase, i) => (
              <div className="ai-roadmap-item" key={i}>
                <div className="ai-roadmap-phase">{phase.phase}</div>
                <div className="ai-roadmap-duration">⏱ {phase.duration}</div>
                <div className="ai-roadmap-subjects">
                  {(phase.subjects || []).map((sub, j) => (
                    <span className="ai-roadmap-subject" key={j}>{sub}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Academic Snapshot */}
      <motion.div
        className="ai-glass-card accent-emerald"
        custom={7}
        initial="hidden"
        animate="visible"
        variants={cardVariant}
        style={{ marginBottom: '1.5rem' }}
      >
        <div className="ai-card-header">
          <div className="ai-card-icon emerald">📋</div>
          <span className="ai-card-title">Academic Snapshot</span>
        </div>
        <div className="ai-profile-info-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">SSLC</span>
            <span className="ai-profile-info-value">{profile.sslc_marks}%</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">2nd PUC</span>
            <span className="ai-profile-info-value">{profile.puc_marks}%</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">CGPA</span>
            <span className="ai-profile-info-value">{profile.cgpa || 'N/A'}</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">Graduation</span>
            <span className="ai-profile-info-value">{profile.graduation_year}</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">Career Goal</span>
            <span className="ai-profile-info-value" style={{ fontSize: '0.8rem' }}>{profile.career_goal || 'Not specified'}</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">Skills</span>
            <span className="ai-profile-info-value" style={{ fontSize: '0.8rem' }}>{profile.skills || 'Not specified'}</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">Favorite Subjects</span>
            <span className="ai-profile-info-value" style={{ fontSize: '0.8rem' }}>{profile.favorite_subjects || 'Not specified'}</span>
          </div>
          <div className="ai-profile-info-item">
            <span className="ai-profile-info-label">Hobbies</span>
            <span className="ai-profile-info-value" style={{ fontSize: '0.8rem' }}>{profile.hobbies || 'Not specified'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
