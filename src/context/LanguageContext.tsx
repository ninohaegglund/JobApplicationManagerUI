import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "sv";

const en = {
  "language.switchLabel": "Choose language",
  "language.english": "English",
  "language.swedish": "Swedish",

  "header.searchPlaceholder": "Search applications, companies...",
  "header.unreadNotifications": "Unread notifications",
  "header.noUnreadNotifications": "No unread notifications.",
  "header.viewAllNotifications": "View all notifications",
  "header.signOut": "Sign Out",
  "header.authenticatedUser": "Authenticated User",
  "header.identityAccount": "Identity account",

  "nav.dashboard": "Dashboard",
  "nav.applications": "Applications",
  "nav.calendar": "Calendar",
  "nav.notifications": "Notifications",
  "nav.profile": "Profile",
  "nav.cvDocuments": "CV Documents",
  "nav.exports": "Exports",
  "nav.settings": "Settings",

  "pages.dashboard.subtitle": "Overview of your job application progress",
  "pages.applications.subtitle": "Manage all your job applications",
  "pages.createApplication.title": "Create New Application",
  "pages.createApplication.subtitle": "Add a new job application to track",
  "pages.createApplication.backToApplications": "Back to Applications",
  "applicationQuality.label": "Application Quality",
  "applicationQuality.all": "All qualities",
  "applicationQuality.unrated": "Not rated",
  "applicationQuality.strong": "Strong match",
  "applicationQuality.moderate": "Moderate match",
  "applicationQuality.stretch": "Stretch application",
  "applicationQuality.strongShort": "Strong",
  "applicationQuality.moderateShort": "Moderate",
  "applicationQuality.stretchShort": "Stretch",
  "applicationQuality.unratedShort": "Unrated",
  "applicationQuality.breakdown": "Quality breakdown",
  "pages.calendar.subtitle": "Track interviews, deadlines, and follow-ups",
  "pages.notifications.subtitle": "Stay on top of reminders and updates",
  "pages.profile.subtitle": "Manage your applicant information",
  "pages.cvDocuments.subtitle": "Manage your curriculum vitae versions",
  "pages.exports.subtitle": "Download your job application data",
  "pages.settings.subtitle": "Configure your application preferences",

  "settings.general": "General",
  "settings.language.title": "Language",
  "settings.language.description": "Switch between English and Swedish.",
} as const;

export type TranslationKey = keyof typeof en;

const sv: Record<TranslationKey, string> = {
  "language.switchLabel": "Välj språk",
  "language.english": "Engelska",
  "language.swedish": "Svenska",

  "header.searchPlaceholder": "Sök bland ansökningar, företag...",
  "header.unreadNotifications": "Olästa aviseringar",
  "header.noUnreadNotifications": "Inga olästa aviseringar.",
  "header.viewAllNotifications": "Visa alla aviseringar",
  "header.signOut": "Logga ut",
  "header.authenticatedUser": "Inloggad användare",
  "header.identityAccount": "Identitetskonto",

  "nav.dashboard": "Översikt",
  "nav.applications": "Ansökningar",
  "nav.calendar": "Kalender",
  "nav.notifications": "Aviseringar",
  "nav.profile": "Profil",
  "nav.cvDocuments": "CV-dokument",
  "nav.exports": "Exporter",
  "nav.settings": "Inställningar",

  "pages.dashboard.subtitle": "Översikt över dina jobbansökningar",
  "pages.applications.subtitle": "Hantera alla dina jobbansökningar",
  "pages.createApplication.title": "Skapa ny ansökan",
  "pages.createApplication.subtitle": "Lägg till en ny jobbansökan att följa",
  "pages.createApplication.backToApplications": "Tillbaka till ansökningar",
  "applicationQuality.label": "Ansökningskvalitet",
  "applicationQuality.all": "Alla kvaliteter",
  "applicationQuality.unrated": "Ej bedömd",
  "applicationQuality.strong": "Stark matchning",
  "applicationQuality.moderate": "Måttlig matchning",
  "applicationQuality.stretch": "Stretch-ansökan",
  "applicationQuality.strongShort": "Stark",
  "applicationQuality.moderateShort": "Måttlig",
  "applicationQuality.stretchShort": "Stretch",
  "applicationQuality.unratedShort": "Ej bedömd",
  "applicationQuality.breakdown": "Kvalitetsfördelning",
  "pages.calendar.subtitle": "Följ intervjuer, deadlines och uppföljningar",
  "pages.notifications.subtitle": "Håll koll på påminnelser och uppdateringar",
  "pages.profile.subtitle": "Hantera din kandidatprofil",
  "pages.cvDocuments.subtitle": "Hantera dina CV-versioner",
  "pages.exports.subtitle": "Ladda ner data om dina jobbansökningar",
  "pages.settings.subtitle": "Konfigurera dina appinställningar",

  "settings.general": "Allmänt",
  "settings.language.title": "Språk",
  "settings.language.description": "Växla mellan engelska och svenska.",
};

const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  sv,
};

const STORAGE_KEY = "jobTrackerLanguage";
const defaultLanguage: Language = "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "sv";
}

function readStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  try {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(storedLanguage) ? storedLanguage : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage());

  useEffect(() => {
    window.document.documentElement.lang = language;

    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The app can still switch language if localStorage is unavailable.
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((current) => (current === "en" ? "sv" : "en")),
      t: (key) => translations[language][key],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return context;
}
