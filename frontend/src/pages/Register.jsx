import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email) {
        toast.error('Please fill in your basic details first.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.password || !form.confirmPassword) {
        toast.error('Please enter passwords.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created!');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (platform) => {
    setLoading(true);
    const mockEmail = `social.${platform.toLowerCase()}@eduverse.ai`;
    const mockName = `Demo ${platform} User`;
    const mockPass = 'demouser123';
    
    toast.loading(`Creating account with ${platform}...`, { id: 'social-reg' });
    try {
      const data = await register({ name: mockName, email: mockEmail, password: mockPass, role: 'student' });
      toast.success(`Account created! Welcomed via ${platform}`, { id: 'social-reg' });
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      // If user already exists, log them in automatically
      try {
        const data = await login(mockEmail, mockPass);
        toast.success(`Welcome back! Authenticated via ${platform}`, { id: 'social-reg' });
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (authErr) {
        toast.error(err.response?.data?.message || 'Social Registration failed', { id: 'social-reg' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-orb-1"></div>
      <div className="auth-orb-2"></div>

      <div className="auth-card">
        <div className="text-center mb-6">
          <Link to="/" className="auth-brand">EduVerse AI</Link>
          <h1 className="text-2xl font-bold text-white mt-1">Create Account 🚀</h1>
          <p className="text-emerald-100/60 text-sm">Join the smart AI learning platform</p>
        </div>

        {/* Step Indicator Header */}
        <div className="flex justify-center items-center gap-2 mb-6 text-xs font-semibold text-emerald-100/40">
          <span className={`px-2.5 py-1 rounded-md ${step >= 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}`}>1. Details</span>
          <span className="text-emerald-500/20">➔</span>
          <span className={`px-2.5 py-1 rounded-md ${step >= 2 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}`}>2. Security</span>
          <span className="text-emerald-500/20">➔</span>
          <span className={`px-2.5 py-1 rounded-md ${step >= 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}`}>3. Customize</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-[authFadeIn_0.3s_ease]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Full Name</label>
                <div className="auth-input-container">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <span className="auth-input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Email Address</label>
                <div className="auth-input-container">
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <span className="auth-input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </span>
                </div>
              </div>

              <button type="button" className="auth-submit-btn mt-2" onClick={handleNextStep}>
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-[authFadeIn_0.3s_ease]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Password</label>
                <div className="auth-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <span className="auth-input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Confirm Password</label>
                <div className="auth-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                  <span className="auth-input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" className="auth-social-btn flex-1" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="auth-submit-btn flex-1" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-[authFadeIn_0.3s_ease]">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Select Learning Role</label>
                <div className="role-tabs">
                  <button
                    type="button"
                    className={`role-tab-btn ${form.role === 'student' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, role: 'student' })}
                  >
                    🧑‍🎓 Student
                  </button>
                  <button
                    type="button"
                    className={`role-tab-btn ${form.role === 'developer' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, role: 'developer' })}
                  >
                    💻 Developer
                  </button>
                  <button
                    type="button"
                    className={`role-tab-btn ${form.role === 'admin' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, role: 'admin' })}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-100/70">
                {form.role === 'student' && "🎓 Gain subject materials, take quizzes, run practice algorithms, and track your college grades."}
                {form.role === 'developer' && "💻 Build full code bases, access AI coding tutors, and deploy ML predictive algorithms."}
                {form.role === 'admin' && "🛡️ Admin console permissions. Upload dataset tables, train regression matrices, and delete profiles."}
              </div>

              <div className="flex gap-3">
                <button type="button" className="auth-social-btn flex-1" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="submit" className="auth-submit-btn flex-1" disabled={loading}>
                  {loading ? <span className="auth-spinner"></span> : 'Confirm & Join'}
                </button>
              </div>
            </div>
          )}
        </form>

        {step < 3 && (
          <>
            <div className="auth-divider">or signup with</div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignup('Google')}>
                Google
              </button>
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignup('GitHub')}>
                GitHub
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-emerald-100/50 mt-6">
          Already have an account? <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition">Sign In</Link>
        </p>

        <p className="text-center text-[10px] text-emerald-100/30 uppercase tracking-widest mt-6">
          Your AI tutor will personalize your experience
        </p>
      </div>
    </div>
  );
}
