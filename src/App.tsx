import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { ChatProvider, useChat } from './context/ChatContext'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './components/Auth'
import AuthCallback from './components/Auth/AuthCallback'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import UserProfile from './components/UserProfile'
import MainApp from './components/MainApp'
import DebugAuth from './debug-auth'
import './App.css'

const App = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={
        user ? <Navigate to="/" replace /> : <AuthPage />
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/debug-auth" element={
        <ProtectedRoute>
          <DebugAuth />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
