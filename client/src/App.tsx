import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './components/Auth'
import AuthCallback from './components/Auth/AuthCallback'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { MainApp } from './components'
import DebugAuth from './debug-auth'
import DebugOAuth from './debug-oauth'
import './styles/App.css'
import * as Sentry from '@sentry/react'

const App = () => {
  const { user } = useAuth();
  
  
  return (
    <Sentry.ErrorBoundary fallback={<div>Something went wrong.</div>}>
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
        <Route path="/debug-oauth" element={<DebugOAuth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Sentry.ErrorBoundary>
  );
};

export default App;
