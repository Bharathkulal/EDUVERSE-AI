import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                       (err.message === 'Network Error' ? 'Could not connect to the backend server. Please make sure the backend is running.' : 'Login failed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-orb-1"></div>
      <div className="auth-orb-2"></div>

      <div className="auth-card">
        <div className="text-center mb-8">
          <Link to="/" className="auth-brand">EduVerse AI</Link>
          <h1 className="text-2xl font-bold text-white mt-2">Welcome Back 👋</h1>
          <p className="text-emerald-100/60 text-sm mt-1">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Email Address</label>
            <div className="auth-input-container">
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@eduverse.ai"
              />
              <span className="auth-input-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition">
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-emerald-100/50 mt-6">
          New here? <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition">Create Account</Link>
        </p>

        <div className="mt-6 p-4 rounded-xl bg-black/20 border border-emerald-500/10 text-xs text-emerald-100/60 space-y-1">
          <p className="font-semibold text-emerald-400">Demo Accounts Available:</p>
          <div className="flex justify-between">
            <span>Student: student@eduverse.ai</span>
            <span className="text-emerald-500/80">student123</span>
          </div>
          <div className="flex justify-between">
            <span>Admin: admin@eduverse.ai</span>
            <span className="text-emerald-500/80">admin123</span>
          </div>
        </div>

        <p className="text-center text-[10px] text-emerald-100/30 uppercase tracking-widest mt-6">
          Your AI tutor will personalize your experience
        </p>
      </div>
    </div>
  );
}
