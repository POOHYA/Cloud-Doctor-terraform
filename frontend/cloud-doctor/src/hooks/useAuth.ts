import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

export const useAuth = () => {
  const [adminUser, setAdminUser] = useState<string | null>(() => sessionStorage.getItem('fullName'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fullName = sessionStorage.getItem('fullName');
    if (fullName) {
      setAdminUser(fullName);
    }

    const handleStorageChange = () => {
      const updatedFullName = sessionStorage.getItem('fullName');
      setAdminUser(updatedFullName);
    };

    window.addEventListener('auth-change', handleStorageChange);
    return () => window.removeEventListener('auth-change', handleStorageChange);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const isValid = await adminApi.login(username, password);
      if (isValid) {
        const fullName = sessionStorage.getItem('fullName');
        setAdminUser(fullName);
        window.dispatchEvent(new Event('auth-change'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await adminApi.logout();
    setAdminUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/', { replace: true });
  };

  return { adminUser, loading, login, logout };
};