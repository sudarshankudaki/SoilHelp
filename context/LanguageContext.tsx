import React, { createContext, useContext, useState, ReactNode } from 'react';
import { commonTranslations, Language, translations } from '../constants/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'] | keyof typeof commonTranslations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations['en'] | keyof typeof commonTranslations) => {
    return translations[language][key as keyof typeof translations['en']]
      || translations.en[key as keyof typeof translations['en']]
      || commonTranslations[key as keyof typeof commonTranslations];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
