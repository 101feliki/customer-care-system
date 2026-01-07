import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

// Import pages
import Dashboard from './pages/EnhancedDashboard';
import NotificationsPage from './pages/NotificationsPage';
import RecipientsPage from './pages/RecipientsPage';
import TemplatesPage from './pages/TemplatesPage';
import SendNotificationPage from './pages/SendNotificationPage';
import SettingsPage from './pages/settingsPage';

const AppRouter: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<div>Messages Page - Coming Soon</div>} />
          <Route path="/recipients" element={<RecipientsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/send-notification" element={<SendNotificationPage />} />
          <Route path="/archive" element={<div>Archive Page - Coming Soon</div>} />
          <Route path="/analytics" element={<div>Analytics Page - Coming Soon</div>} />
          <Route path="/schedule" element={<div>Schedule Page - Coming Soon</div>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default AppRouter;