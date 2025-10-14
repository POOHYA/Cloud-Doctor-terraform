import { useState } from 'react';
import { adminApi } from '../api/admin';

export const useAuth = () => {
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const isValid = await adminApi.login(username, password);
      if (isValid) {
        setAdminUser(username);
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

  const logout = () => {
    setAdminUser(null);
  };

  return { adminUser, loading, login, logout };
};