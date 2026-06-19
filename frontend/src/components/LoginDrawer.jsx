import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginDrawer({ isOpen, onClose, onOpenRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      onClose();
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                       (err.message === 'Network Error' ? 'Could not connect to the backend server. Please make sure the backend is running.' : 'Login failed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (platform) => {
    setLoading(true);
    const selectedEmail = platform === 'Google' ? 'student@eduverse.ai' : 'admin@eduverse.ai';
    const selectedPassword = platform === 'Google' ? 'student123' : 'admin123';
    
    toast.loading(`Signing in with ${platform}...`, { id: 'drawer-social' });
    try {
      const data = await login(selectedEmail, selectedPassword);
      toast.success(`Welcome back! Authenticated via ${platform}`, { id: 'drawer-social' });
      onClose();
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Social authentication failed', { id: 'drawer-social' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Dark Blur Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Login Drawer Container */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-[420px] h-full bg-[#0a0a2e]/95 border-l border-indigo-500/20 backdrop-blur-xl shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-[drawerSlideIn_0.35s_cubic-bezier(0.16,1,0.3,1)_both]"
      >
        {/* Top Header section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              EduVerse AI
            </span>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-300 flex items-center justify-center transition"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome Back 👋</h2>
            <p className="text-indigo-100/60 text-sm mt-1">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-indigo-100/70 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full bg-black/30 border border-indigo-500/20 focus:border-indigo-500/60 focus:bg-black/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@eduverse.ai"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500/40">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-indigo-100/70 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-black/30 border border-indigo-500/20 focus:border-indigo-500/60 focus:bg-black/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] rounded-xl py-2.5 pl-10 pr-10 text-white text-sm outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500/40">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500/40 hover:text-indigo-300 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Sign In'}
            </button>
          </form>

          {/* Social login divider */}
          <div className="flex items-center text-center text-indigo-100/20 text-xs my-6">
            <span className="flex-1 border-b border-indigo-500/10"></span>
            <span className="px-3">or continue with</span>
            <span className="flex-1 border-b border-indigo-500/10"></span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 py-2 border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl text-white text-xs font-semibold transition"
              onClick={() => handleSocialLogin('Google')}
            >
              Google
            </button>
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 py-2 border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl text-white text-xs font-semibold transition"
              onClick={() => handleSocialLogin('GitHub')}
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Bottom footer section */}
        <div className="space-y-4">
          <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] text-indigo-100/60 space-y-1">
            <p className="font-bold text-indigo-400">Demo Accounts:</p>
            <p>Student: student@eduverse.ai / student123</p>
            <p>Admin: admin@eduverse.ai / admin123</p>
          </div>

          <p className="text-center text-xs text-indigo-100/50">
            Don't have an account?{' '}
            <button 
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="text-indigo-400 font-semibold hover:underline bg-none border-none cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
