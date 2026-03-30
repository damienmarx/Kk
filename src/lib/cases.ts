import { useState, useEffect } from 'react';

export interface Case {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  status: 'active' | 'closed' | 'archived';
  targetIds: string[];
  investigationIds: string[];
  reportIds: string[];
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('aegis_cases');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => {
    return localStorage.getItem('aegis_active_case_id');
  });

  useEffect(() => {
    localStorage.setItem('aegis_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    if (activeCaseId) {
      localStorage.setItem('aegis_active_case_id', activeCaseId);
    } else {
      localStorage.removeItem('aegis_active_case_id');
    }
  }, [activeCaseId]);

  const createCase = (name: string, description: string) => {
    const newCase: Case = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: Date.now(),
      status: 'active',
      targetIds: [],
      investigationIds: [],
      reportIds: [],
    };
    setCases(prev => [...prev, newCase]);
    return newCase;
  };

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (activeCaseId === id) setActiveCaseId(null);
  };

  const addTargetToCase = (caseId: string, targetId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId && !c.targetIds.includes(targetId)) {
        return { ...c, targetIds: [...c.targetIds, targetId] };
      }
      return c;
    }));
  };

  const addInvestigationToCase = (caseId: string, investigationId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId && !c.investigationIds.includes(investigationId)) {
        return { ...c, investigationIds: [...c.investigationIds, investigationId] };
      }
      return c;
    }));
  };

  const addReportToCase = (caseId: string, reportId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId && !c.reportIds.includes(reportId)) {
        return { ...c, reportIds: [...c.reportIds, reportId] };
      }
      return c;
    }));
  };

  return {
    cases,
    activeCaseId,
    setActiveCaseId,
    createCase,
    updateCase,
    deleteCase,
    addTargetToCase,
    addInvestigationToCase,
    addReportToCase,
    activeCase: cases.find(c => c.id === activeCaseId) || null,
  };
}
