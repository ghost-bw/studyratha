import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  HiOutlineArrowRightOnRectangle, 
  HiOutlineSquares2X2, 
  HiOutlineUsers, 
  HiOutlineCheckBadge, 
  HiOutlineBars3, 
  HiXMark,
  HiOutlineBell,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { useState, useRef, useEffect } from 'react';
import logo from '../assets/icon.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform overflow-hidden">
              <img src={logo} alt="Ratha Logo" className="w-full h-full " />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white font-serif">Ratha</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2 font-bold transition-all">
              <HiOutlineSquares2X2 size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/groups" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2 font-bold transition-all">
              <HiOutlineUsers size={20} />
              <span>Groups</span>
            </Link>
            <Link to="/tasks" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-2 font-bold transition-all">
              <HiOutlineCheckBadge size={20} />
              <span>Tasks</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-primary-600 transition-all relative"
              >
                <HiOutlineBell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button 
                      onClick={markAllRead}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-sm font-medium">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id}
                          className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            // Optionally navigate to n.link
                          }}
                        >
                          {!n.isRead && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              n.type === 'ANNOUNCEMENT' ? 'bg-blue-100 text-blue-600' :
                              n.type === 'TASK_DEADLINE' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              <HiOutlineBell size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.name}</span>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 transition-all hover:scale-110"
                title="Logout"
              >
                <HiOutlineArrowRightOnRectangle size={20} />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="relative">
              <HiOutlineBell size={24} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 p-2">
              {isOpen ? <HiXMark size={28} /> : <HiOutlineBars3 size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={() => setIsOpen(false)}>
            <HiOutlineSquares2X2 size={22} className="text-primary-600" />
            <span>Dashboard</span>
          </Link>
          <Link to="/groups" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={() => setIsOpen(false)}>
            <HiOutlineUsers size={22} className="text-primary-600" />
            <span>Groups</span>
          </Link>
          <Link to="/tasks" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={() => setIsOpen(false)}>
            <HiOutlineCheckBadge size={22} className="text-primary-600" />
            <span>Tasks</span>
          </Link>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <HiOutlineArrowRightOnRectangle size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
