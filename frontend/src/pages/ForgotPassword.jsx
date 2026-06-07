import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      if (data.resetToken) {
        setToken(data.resetToken);
        toast('Dev mode: reset token copied to form', { icon: '🔑' });
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset! You can now login.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-slate-900 p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        {step === 1 && (
          <form onSubmit={requestReset} className="space-y-4">
            <input type="email" className="input-field" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary w-full" disabled={loading}>Send Reset Link</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <input className="input-field" placeholder="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} required />
            <input type="password" className="input-field" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <button type="submit" className="btn-primary w-full" disabled={loading}>Reset Password</button>
          </form>
        )}
        {step === 3 && (
          <p className="text-center text-green-600">Password reset successful!</p>
        )}
        <p className="text-center mt-6"><Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link></p>
      </div>
    </div>
  );
}
