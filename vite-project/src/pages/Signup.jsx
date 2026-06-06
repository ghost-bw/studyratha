import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/icon.png';

const Signup = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(!!location.state?.email);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      setShowOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = '/dashboard'; // Force reload to update context
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-serif">Ratha</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {showOtpStep ? "Verify your email" : "Join Ratha and start tracking your goals"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {!showOtpStep ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
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
              type="submit" disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Sign Up</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-sm text-slate-500 text-center">
              We've sent a 6-digit code to <span className="font-bold text-slate-900 dark:text-white">{email}</span>
            </p>
            <div>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required maxLength="6"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-center text-2xl tracking-[1em] font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" disabled={isSubmitting || otp.length !== 6}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Verify & Finish</span>}
            </button>
            <button 
              type="button" onClick={() => setShowOtpStep(false)}
              className="w-full text-sm text-slate-500 hover:text-primary-600 transition-colors"
            >
              Change Email
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
