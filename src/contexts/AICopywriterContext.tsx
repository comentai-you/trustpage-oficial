import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AICopywriterSettings {
  niche: string;
  pageType: 'sales' | 'vsl' | 'bio';
}

interface AICopywriterContextType {
  settings: AICopywriterSettings;
  updateSettings: (settings: Partial<AICopywriterSettings>) => void;
  isConfigured: boolean;
}

const AICopywriterContext = createContext<AICopywriterContextType | undefined>(undefined);

export const useAICopywriter = () => {
  const context = useContext(AICopywriterContext);
  if (!context) {
    throw new Error('useAICopywriter must be used within an AICopywriterProvider');
  }
  return context;
};

interface AICopywriterProviderProps {
  children: ReactNode;
  initialPageType?: 'sales' | 'vsl' | 'bio';
}

export const AICopywriterProvider = ({ children, initialPageType = 'sales' }: AICopywriterProviderProps) => {
  const [settings, setSettings] = useState<AICopywriterSettings>({
    niche: '',
    pageType: initialPageType
  });

  const updateSettings = (newSettings: Partial<AICopywriterSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const isConfigured = settings.niche.trim().length > 0;

  return (
    <AICopywriterContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </AICopywriterContext.Provider>
  );
};
