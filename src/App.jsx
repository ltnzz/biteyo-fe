import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />        
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}
