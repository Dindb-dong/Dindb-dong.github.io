import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'portfolio-language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ko';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  const setLanguageTo = (lang) => {
    if (lang === 'ko' || lang === 'en') {
      setLanguage(lang);
    }
  };

  const getJsonPath = (baseName) => {
    return language === 'en' ? `eng_${baseName}` : baseName;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: setLanguageTo, toggleLanguage, getJsonPath }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
