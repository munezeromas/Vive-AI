import { createContext, useContext, useState, useEffect } from "react";

export type AppLanguage = "en" | "fr" | "rw" | "sw";

export interface LanguageOption {
  code: AppLanguage;
  flag: string;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", flag: "🇺🇸", label: "English",     nativeLabel: "English" },
  { code: "fr", flag: "🇫🇷", label: "French",      nativeLabel: "Français" },
  { code: "rw", flag: "🇷🇼", label: "Kinyarwanda", nativeLabel: "Kinyarwanda" },
  { code: "sw", flag: "🇰🇪", label: "Kiswahili",   nativeLabel: "Kiswahili" },
];

// ── UI strings for each language ──────────────────────────────────────────────
export const UI_STRINGS: Record<AppLanguage, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    tutor: "Vive AI",
    aiQuizzes: "AI Quizzes",
    languages: "Languages",
    lectures: "Lectures",
    practice: "Practice",
    simplify: "Simplify",
    homework: "Homework",
    tests: "Tests",
    library: "Library",
    schedule: "Schedule",
    analytics: "Analytics",
    messages: "Messages",
    community: "Community",
    career: "Career",
    logout: "Logout",
    search: "Search...",
    greeting: "Good day",
    welcome: "Welcome back",
  },
  fr: {
    dashboard: "Tableau de bord",
    tutor: "Vive AI",
    aiQuizzes: "Quiz IA",
    languages: "Langues",
    lectures: "Cours",
    practice: "Pratique",
    simplify: "Simplifier",
    homework: "Devoirs",
    tests: "Tests",
    library: "Bibliothèque",
    schedule: "Calendrier",
    analytics: "Analytique",
    messages: "Messages",
    community: "Communauté",
    career: "Carrière",
    logout: "Déconnexion",
    search: "Rechercher...",
    greeting: "Bonjour",
    welcome: "Bon retour",
  },
  rw: {
    dashboard: "Imbonerahamwe",
    tutor: "Vive AI",
    aiQuizzes: "Ibibazo bya AI",
    languages: "Indimi",
    lectures: "Amasomo",
    practice: "Imyitozo",
    simplify: "Gukora Byoroshye",
    homework: "Akazi k'Urugo",
    tests: "Ibizamini",
    library: "Ibibazo",
    schedule: "Gahunda",
    analytics: "Imibare",
    messages: "Ubutumwa",
    community: "Iterambere",
    career: "Akazi",
    logout: "Gusohoka",
    search: "Shakisha...",
    greeting: "Mwaramutse",
    welcome: "Murakaza neza",
  },
  sw: {
    dashboard: "Dashibodi",
    tutor: "Vive AI",
    aiQuizzes: "Maswali ya AI",
    languages: "Lugha",
    lectures: "Masomo",
    practice: "Mazoezi",
    simplify: "Rahisisha",
    homework: "Kazi ya Nyumbani",
    tests: "Mitihani",
    library: "Maktaba",
    schedule: "Ratiba",
    analytics: "Takwimu",
    messages: "Ujumbe",
    community: "Jumuiya",
    career: "Kazi",
    logout: "Toka",
    search: "Tafuta...",
    greeting: "Habari",
    welcome: "Karibu tena",
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
  currentLang: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
  currentLang: LANGUAGES[0],
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vive-language") as AppLanguage) || "en";
    }
    return "en";
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("vive-language", lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string): string => {
    return UI_STRINGS[language]?.[key] ?? UI_STRINGS["en"]?.[key] ?? key;
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
