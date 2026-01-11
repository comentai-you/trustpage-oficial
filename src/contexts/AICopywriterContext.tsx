import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AICopywriterSettings {
  niche: string;
  pageType: 'sales' | 'vsl' | 'bio';
}

interface AICopywriterContextType {
  settings: AICopywriterSettings;
  updateSettings: (settings: Partial<AICopywriterSettings>) => void;
  isConfigured: boolean;
}

const STORAGE_KEY = 'ai-copywriter-settings';

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

const getStoredSettings = (): AICopywriterSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading AI settings from localStorage:', e);
  }
  return null;
};

const saveSettings = (settings: AICopywriterSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving AI settings to localStorage:', e);
  }
};

export const AICopywriterProvider = ({ children, initialPageType = 'sales' }: AICopywriterProviderProps) => {
  const [settings, setSettings] = useState<AICopywriterSettings>(() => {
    const stored = getStoredSettings();
    if (stored) {
      return {
        ...stored,
        pageType: initialPageType // Always use the page's type
      };
    }
    return {
      niche: '',
      pageType: initialPageType
    };
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
