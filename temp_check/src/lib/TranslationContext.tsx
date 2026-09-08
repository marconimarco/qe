import React, { createContext, useContext, ReactNode } from 'react';
import { LanguageCode } from '../types';
import { translations } from './translations';

interface TranslationContextType {
  t: (key: string, variables?: Record<string, string | number>) => string;
  language: LanguageCode;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ language, children }: { language: LanguageCode; children: ReactNode }) {
  const t = (key: string, variables?: Record<string, string | number>) => {
    let text = translations[language]?.[key] || translations['it']?.[key] || translations['en']?.[key] || key;
    
    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        text = text.replace(new RegExp(`{${vKey}}`, 'g'), String(vVal));
      });
    }
    
    return text;
  };

  return (
    <TranslationContext.Provider value={{ t, language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
