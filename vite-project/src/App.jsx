import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {user && <Navbar />}
      <main className={user ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
