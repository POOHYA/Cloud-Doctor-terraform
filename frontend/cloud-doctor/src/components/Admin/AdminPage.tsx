import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../hooks/useAuth';

export default function AdminPage() {
  const { adminUser, logout } = useAuth();
  const role = sessionStorage.getItem('role');

  if (!adminUser) {
    return <AdminLogin />;
  }

  if (role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">관리자 권한이 필요합니다</h2>
        <p className="text-gray-600 mb-6">이 페이지는 관리자만 접근할 수 있습니다.</p>
        <button
          onClick={logout}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<AdminDashboard adminUser={adminUser} onLogout={logout} />} />
    </Routes>
  );
}