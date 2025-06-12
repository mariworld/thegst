import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './components/Auth'
import AuthCallback from './components/Auth/AuthCallback'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { MainApp } from './components'
import DebugAuth from './debug-auth'
import './styles/App.css'

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
