import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineExclamationCircle, 
  HiOutlineArrowTrendingUp, 
  HiPlus, 
  HiArrowRight,
  HiOutlineCalendar,
  HiOutlineSquares2X2
} from 'react-icons/hi2';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, iconColor, bgColor, subValue }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className={iconColor} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">
    <HiOutlineClock className="animate-spin text-primary-600" size={40} />
  </div>;

  const chartData = stats?.completionTrend?.map(item => ({
    name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <HiOutlineSquares2X2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back to <span className="font-serif text-primary-600">Ratha</span>.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <HiPlus size={20} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={stats?.totalTasks || 0} 
          icon={HiOutlineCalendar} 
          iconColor="text-blue-500"
          bgColor="bg-blue-500/10"
          subValue="Across all groups"
        />
        <StatCard 
          title="Completed" 
          value={stats?.completedTasks || 0} 
          icon={HiOutlineCheckCircle} 
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
          subValue={`${Math.round(stats?.completionPercentage || 0)}% completion rate`}
        />
        <StatCard 
          title="In Progress" 
          value={stats?.inProgressTasks || 0} 
          icon={HiOutlineClock} 
          iconColor="text-amber-500"
          bgColor="bg-amber-500/10"
          subValue="Action required"
        />
        <StatCard 
          title="Pending" 
          value={stats?.pendingTasks || 0} 
          icon={HiOutlineExclamationCircle} 
          iconColor="text-red-500"
          bgColor="bg-red-500/10"
          subValue="Yet to start"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2 uppercase tracking-widest text-sm">
              <HiOutlineArrowTrendingUp size={20} className="text-primary-600" />
              <span>Activity Trend</span>
            </h3>
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 700
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0284c7' : '#bae6fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Quick Actions</h3>
          <div className="space-y-4">
            {[
              { label: 'Join a Study Group', desc: 'Enter an invite code', icon: HiArrowRight, path: '/groups' },
              { label: 'Create a Group', desc: 'Start your own circle', icon: HiPlus, path: '/groups' },
              { label: 'View All Tasks', desc: 'See your full schedule', icon: HiOutlineCalendar, path: '/tasks' },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => navigate(action.path)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group text-left"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{action.desc}</p>
                </div>
                <action.icon size={20} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
