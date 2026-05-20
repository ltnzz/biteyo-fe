import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Sidebar from './components/SideBar';
import MainHeader from './components/MainHeader';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';
import AddPage from './pages/AddPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BiteDetailPage from './pages/BiteDetailPage';
import { Bell, Home, PlusCircle, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function MobileNav() {
  const location = useLocation();
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/add', icon: PlusCircle, label: 'Post' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/'
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                isActive ? 'bg-pink-50 text-pink-500' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const hideSidebarRoutes = ['/login', '/signup', '/forgotpassword'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-white">
      {showSidebar && (
        <div className="hidden h-screen w-64 shrink-0 overflow-visible border-r border-gray-100 bg-white lg:sticky lg:top-0 lg:block">
          <Sidebar />
        </div>
      )}
      <div className={`min-h-screen min-w-0 flex-1 ${showSidebar ? 'pb-20 lg:pb-0' : ''}`}>
        {showSidebar && <MainHeader />}
        
        <Routes>
          <Route path="/" element={<Homepage />} />        
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/bites/:biteId" element={<BiteDetailPage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <AddPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {showSidebar && <MobileNav />}
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
