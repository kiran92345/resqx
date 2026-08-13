import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AppLanguage, TranslationKey } from "../i18n/translations";
import { t as translate } from "../i18n/translations";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("resqx_language");
    if (saved === "te" || saved === "ta" || saved === "kn" || saved === "en") return saved;
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("resqx_language", language);
    document.documentElement.lang = language === "en" ? "en" : language;
  }, [language]);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
