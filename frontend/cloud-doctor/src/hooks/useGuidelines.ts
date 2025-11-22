import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { GuidelineDetail } from '../types/guideline';

export const useGuidelines = () => {
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

  const getGuidelineById = async (id: string) => {
    try {
      const guideline = await adminApi.getGuideline(Number(id));
      setSelectedGuideline(guideline);
      setIsModalOpen(true);
    } catch (error) {
      console.error('가이드라인 상세 조회 실패:', error);
    }
  };

  const updateGuideline = async (id: string, data: Partial<GuidelineDetail>) => {
    try {
      await adminApi.updateGuideline(Number(id), {
        title: data.title || '',
        cloudProviderId: 1,
        serviceListId: 1,
        importanceLevel: data.priority || 'confirm',
        whyDangerous: data.content?.whyDangerous || '',
        whatHappens: data.content?.whatHappens || '',
        checkStandard: data.content?.checkCriteria || '',
        solutionText: '',
        sideEffects: data.content?.sideEffect || '',
        note: data.note1 || '',
        links: data.uncheckedCases || []
      });
      await loadGuidelines();
      setIsModalOpen(false);
      setSelectedGuideline(null);
    } catch (error) {
      console.error('가이드라인 수정 실패:', error);
    }
  };

  const createGuideline = async (data: {
    title: string;
    cloudProviderId: number;
    serviceListId: number;
    importanceLevel: string;
    whyDangerous: string;
    whatHappens: string;
    checkStandard: string;
    solutionText?: string;
    sideEffects?: string;
    note?: string;
    links?: string[];
  }) => {
    try {
      await adminApi.createGuideline(data);
      await loadGuidelines();
    } catch (error) {
      console.error('가이드라인 생성 실패:', error);
    }
  };

  const deleteGuideline = async (id: string) => {
    try {
      await adminApi.deleteGuideline(id);
      await loadGuidelines();
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
    getGuidelineById,
    updateGuideline,
    createGuideline,
    deleteGuideline,
    closeModal
  };
};