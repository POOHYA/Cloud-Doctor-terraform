import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../hooks/useAuth';

export default function AdminPage() {
  const { adminUser, loading, login, logout } = useAuth();

  if (!adminUser) {
    return <AdminLogin onLogin={login} loading={loading} />;
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminDashboard adminUser={adminUser} onLogout={logout} />} />
    </Routes>
  );
}