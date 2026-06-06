import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';
import api from '../services/api';
import logo from '../assets/icon.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showResetStep, setShowResetStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setShowResetStep(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, password });
      setMessage(data.message);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or failed to reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4 shadow-xl shadow-primary-500/20 overflow-hidden">
            <img src={logo} alt="Ratha Logo" className="w-full h-full " />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-serif">
            {showResetStep ? "Create New Password" : "Reset Password"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {showResetStep ? "Enter the code and your new password" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-lg font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        {!showResetStep ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Send Reset OTP</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required maxLength="6"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-center text-xl tracking-[0.5em] font-black"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isSubmitting || otp.length !== 6}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Reset Password</span>}
            </button>
            <button 
              type="button" onClick={() => setShowResetStep(false)}
              className="w-full text-sm text-slate-500 hover:text-primary-600 transition-colors py-2 font-medium"
            >
              Change Email
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link to="/login" className="inline-flex items-center text-primary-600 hover:underline font-medium">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
