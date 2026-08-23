import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';

import AdminLayout from './layouts/AdminLayout';

import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Ana sayfa → Login'e yönlendir */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Public route'lar */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Korumalı route'lar */}
              <Route path="/patient/*" element={<ProtectedRoute allowedRoles={['Patient']}><PatientLayout /></ProtectedRoute>} />
              <Route path="/doctor/*"  element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorLayout /></ProtectedRoute>} />
              <Route path="/admin/*"   element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
