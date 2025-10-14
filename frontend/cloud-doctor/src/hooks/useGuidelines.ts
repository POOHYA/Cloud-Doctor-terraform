import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { userApi } from '../api/user';

export const useGuidelines = () => {
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuidelines = async () => {
    try {
      const data = await userApi.getGuidelines();
      setGuidelines(data);
    } catch (error) {
      console.error('가이드라인 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGuideline = async (guideline: string) => {
    const updated = [...guidelines, guideline];
    setGuidelines(updated);
    await adminApi.saveGuidelines(updated);
    window.dispatchEvent(new Event('guidelinesUpdated'));
  };

  const removeGuideline = async (index: number) => {
    const updated = guidelines.filter((_, i) => i !== index);
    setGuidelines(updated);
    await adminApi.saveGuidelines(updated);
    window.dispatchEvent(new Event('guidelinesUpdated'));
  };

  useEffect(() => {
    loadGuidelines();
    
    const handleUpdate = () => loadGuidelines();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('guidelinesUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('guidelinesUpdated', handleUpdate);
    };
  }, []);

  return { guidelines, loading, addGuideline, removeGuideline };
};