import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { GuidelineDetail } from '../types/guideline';

export const useDetailedGuidelines = () => {
  const [guidelines, setGuidelines] = useState<GuidelineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuideline, setSelectedGuideline] = useState<GuidelineDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const updateGuideline = async (id: string, data: Partial<GuidelineDetail>) => {
    try {
      // API 호출 로직 추가 필요
      await loadGuidelines(); // 임시로 전체 리로드
      setIsModalOpen(false);
      setSelectedGuideline(null);
    } catch (error) {
      console.error('가이드라인 수정 실패:', error);
    }
  };

  const getGuidelineById = async (id: string) => {
    const guideline = guidelines.find(g => g.id === id);
    if (guideline) {
      setSelectedGuideline(guideline);
      setIsModalOpen(true);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuideline(null);
  };

  useEffect(() => {
    loadGuidelines();
  }, []);

  return { 
    guidelines, 
    loading, 
    selectedGuideline,
    isModalOpen,
    addGuideline, 
    updateGuideline,
    getGuidelineById,
    removeGuideline,
    closeModal
  };
};