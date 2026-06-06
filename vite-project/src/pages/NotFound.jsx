import { Link } from 'react-router-dom';
import { HiOutlineExclamationTriangle, HiOutlineArrowLeft } from 'react-icons/hi2';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-600 mb-8">
        <HiOutlineExclamationTriangle size={48} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">404 - Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 leading-relaxed font-medium">
        Oops! The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      <Link 
        to="/" 
        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
      >
        <HiOutlineArrowLeft size={20} />
        <span>Back to Safety</span>
      </Link>
    </div>
  );
};

export default NotFound;
