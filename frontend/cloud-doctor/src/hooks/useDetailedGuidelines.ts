import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { GuidelineDetail } from '../types/guideline';

export const useDetailedGuidelines = () => {
  const [guidelines, setGuidelines] = useState<GuidelineDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuidelines = async () => {
    try {
      const data = await adminApi.getGuidelines();
      setGuidelines(data);
    } catch (error) {
      console.error('가이드라인 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGuideline = async (guidelineData: Omit<GuidelineDetail, 'id' | 'createdAt'>) => {
    const newGuideline: GuidelineDetail = {
      ...guidelineData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      await adminApi.saveGuideline(newGuideline);
      setGuidelines(prev => [...prev, newGuideline]);
    } catch (error) {
      console.error('가이드라인 추가 실패:', error);
    }
  };

  const removeGuideline = async (guidelineId: string) => {
    try {
      await adminApi.deleteGuideline(guidelineId);
      setGuidelines(prev => prev.filter(g => g.id !== guidelineId));
    } catch (error) {
      console.error('가이드라인 삭제 실패:', error);
    }
  };

  useEffect(() => {
    loadGuidelines();
  }, []);

  return { guidelines, loading, addGuideline, removeGuideline };
};