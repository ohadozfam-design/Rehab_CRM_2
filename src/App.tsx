import { Navigate, Route, Routes } from 'react-router-dom';
import ThemeController from './components/ThemeController';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <>
      {/* Applies the resolved light/dark theme to <html> app-wide. */}
      <ThemeController />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
        </Route>

        {/* Unknown routes fall back to the dashboard (or login if unauthenticated). */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
