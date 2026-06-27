import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice.js';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AttendanceSession from './pages/AttendanceSession.jsx';
import ResolveUnknowns from './pages/ResolveUnknowns.jsx';
import StudentList from './pages/StudentList.jsx';
import StudentRegistration from './pages/StudentRegistration.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AttendanceHistory from './pages/AttendanceHistory.jsx';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  
  const [loginPortal, setLoginPortal] = useState('faculty'); // 'faculty' or 'student'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Attempt to restore session on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Loading indicator for boot auth check
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white gap-4">
        <span className="h-8 w-8 border-4 border-accent-purple/20 border-t-accent-purple rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
          Initializing ClassLens...
        </p>
      </div>
    );
  }

  // Not logged in view
  if (!isAuthenticated) {
    if (loginPortal === 'student') {
      return (
        <StudentLogin onSwitchToFaculty={() => setLoginPortal('faculty')} />
      );
    }
    return (
      <Login onSwitchToStudent={() => setLoginPortal('student')} />
    );
  }

  // Logged in as student view
  if (user && user.role === 'student') {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex overflow-hidden">
          <StudentDashboard />
        </main>
      </div>
    );
  }

  // Logged in as admin / faculty view
  const renderFacultyContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scan':
        return <AttendanceSession />;
      case 'review-unknown':
        return <ResolveUnknowns />;
      case 'students':
        return <StudentList />;
      case 'register-student':
        return <StudentRegistration />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'attendance-history':
        return <AttendanceHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 flex overflow-hidden">
          {renderFacultyContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
