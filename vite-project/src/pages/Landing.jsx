import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineUsers, HiOutlineChartBarSquare, HiOutlineShieldCheck } from 'react-icons/hi2';

const Landing = () => {
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen">
      {/* Hero Section */}
      <header className="relative container mx-auto px-4 py-20 md:py-40 flex flex-col items-center text-center overflow-hidden">
        {/* Background Image behind text */}
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none"
        >
          <img 
            src="/src/assets/icon.png" 
            alt="" 
            className="w-full max-w-4xl object-contain scale-125"
          />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-bold mb-8 border border-primary-500/20">
            <span>New: Group Analytics are here!</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 max-w-4xl">
            Master Your Studies with <span className="text-primary-600 font-serif">Ratha</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed mx-auto">
            The ultimate study group companion. Track daily tasks, maintain streaks, and grow together with your peers. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/40 transition-all flex items-center justify-center space-x-2 group active:scale-95">
              <span>Get Started for Free</span>
              <HiOutlineArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-10 py-4 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl font-bold text-lg transition-all active:scale-95">
              Login to Ratha
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to stay on track</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Simple yet powerful tools for modern students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Study Groups", 
                desc: "Create or join groups with unique invite codes. Collaborate with up to 50 members.",
                icon: HiOutlineUsers,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-500/10"
              },
              { 
                title: "Task Tracking", 
                desc: "Set priorities, deadlines, and assign tasks. Never miss a study session again.",
                icon: HiOutlineCheckCircle,
                iconColor: "text-green-500",
                bgColor: "bg-green-500/10"
              },
              { 
                title: "Progress Analytics", 
                desc: "Beautiful charts showing your weekly growth and completion rates.",
                icon: HiOutlineChartBarSquare,
                iconColor: "text-primary-600",
                bgColor: "bg-primary-600/10"
              },
              { 
                title: "Role-based Access", 
                desc: "Admins manage members while everyone contributes. Secure and private.",
                icon: HiOutlineShieldCheck,
                iconColor: "text-purple-500",
                bgColor: "bg-purple-500/10"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${feature.bgColor}`}>
                  <feature.icon size={28} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof/CTA */}
      <section className="py-20 text-center container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-primary-600 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-bold mb-6 italic font-serif leading-tight">"The chariot moves forward only when the wheels are consistent."</h2>
            <p className="text-primary-100 text-base md:text-xl mb-10 max-w-2xl mx-auto">Join thousands of students who use Ratha to stay accountable.</p>
            <Link to="/signup" className="inline-block w-full sm:w-auto px-10 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg shadow-black/10 active:scale-95">
              Start Your Journey
            </Link>
          </div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary-700 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-900 py-10 text-center text-slate-400 text-sm">
        <p>© 2026 <span className="font-serif">Ratha</span>. Built for consistency and growth.</p>
      </footer>
    </div>
  );
};

export default Landing;
