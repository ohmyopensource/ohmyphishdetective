import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';
export type Language = 'en' | 'it';

interface Preferences {
  theme: Theme;
  language: Language;
  confirmBeforeDelete: boolean;
  showTechnicalDetails: boolean;
}

interface PreferencesContextValue extends Preferences {
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setConfirmBeforeDelete: (v: boolean) => void;
  setShowTechnicalDetails: (v: boolean) => void;
}

const STORAGE_KEY = 'ohmyphishdetective_preferences';

const defaultPreferences: Preferences = {
  theme: 'dark',
  language: 'en',
  confirmBeforeDelete: true,
  showTechnicalDetails: true,
};

function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', prefs.theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const value: PreferencesContextValue = {
    ...prefs,
    setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
    setLanguage: (language) => setPrefs((p) => ({ ...p, language })),
    setConfirmBeforeDelete: (confirmBeforeDelete) =>
      setPrefs((p) => ({ ...p, confirmBeforeDelete })),
    setShowTechnicalDetails: (showTechnicalDetails) =>
      setPrefs((p) => ({ ...p, showTechnicalDetails })),
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
