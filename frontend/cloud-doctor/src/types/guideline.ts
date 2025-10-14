export interface Service {
  id: string;
  name: string;
  createdAt: string;
}

export interface GuidelineDetail {
  id: string;
  title: string;
  serviceId: string;
  serviceName: string;
  priority: 'confirm' | 'important' | 'urgent';
  content: {
    whyDangerous: string;
    whatHappens: string;
    checkCriteria: string;
    checkImages?: string[];
    sideEffect: string;
  };
  uncheckedCases: string[];
  notes: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  guidelineId: string;
  title: string;
  serviceId: string;
  serviceName: string;
  checked: boolean;
}