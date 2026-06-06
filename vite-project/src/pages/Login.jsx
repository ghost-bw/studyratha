import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';
import logo from '../assets/icon.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      await googleLogin(response.credential, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      navigate('/dashboard');
    } catch (err) {
      if (err.needsVerification) {
        navigate('/signup', { state: { email: err.email } });
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
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
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Login to continue your progress</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
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
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" size={18} className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Login</span>}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div id="googleSignIn"></div>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account? <Link to="/signup" className="text-primary-600 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
