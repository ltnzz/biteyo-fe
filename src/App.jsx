import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Sidebar from './components/SideBar';
import MainHeader from './components/MainHeader';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';
import AddPage from './pages/AddPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AppContent() {
  const location = useLocation();
  const hideSidebarRoutes = ['/login', '/signup', '/forgotpassword'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <div className="fixed inset-0 z-[9999] w-64 shrink-0 sticky top-0 h-screen border-r border-gray-100 bg-white overflow-visible">
          
          <Sidebar />
        </div>
      )}
      <div className="flex-1 min-h-screen">
        {showSidebar && <MainHeader />}
        
        <Routes>
          <Route path="/" element={<Homepage />} />        
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/Notifications" element={<NotificationPage />} />
          <Route path="/add" element={<AddPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}