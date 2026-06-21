import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

const PREFS_KEY = 'freshcatch.preferences';

export type UserPreferences = {
  likes: string;
  dislikes: string;
  dietPreferences: string[];
};

type PreferencesContextValue = {
  preferences: UserPreferences | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  savePreferences: (prefs: UserPreferences) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a <PreferencesProvider>');
  return ctx;
}

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (active && raw) setPreferences(JSON.parse(raw) as UserPreferences);
      } catch {
        // Treat read failures as no saved preferences.
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      hasCompletedOnboarding: preferences !== null,
      isLoading,
      savePreferences,
    }),
    [preferences, isLoading, savePreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
