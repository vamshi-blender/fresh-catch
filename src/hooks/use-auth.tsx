import { type Session, type User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { supabase } from '@/lib/supabase';

// TODO REMOVE BEFORE PRODUCTION — enables the "a"/"a" login bypass in ALL builds
// (including release APKs). Set to false or delete before shipping to the store.
const DEV_LOGIN_BYPASS = true;

type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  /** True while the persisted Supabase session is being restored on launch. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) setSession(data.session);
      } catch {
        if (active) setSession(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // TODO REMOVE BEFORE PRODUCTION — login bypass: typing "a" in both fields logs
    // in with a fake session so we don't have to enter real credentials while testing.
    if (DEV_LOGIN_BYPASS && email === 'a' && password === 'a') {
      const now = Math.floor(Date.now() / 1000);
      const fakeSession = {
        access_token: 'dev-bypass',
        refresh_token: 'dev-bypass',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: now + 3600,
        user: {
          id: 'dev-bypass-user',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'dev@example.com',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date(now * 1000).toISOString(),
        },
      } as unknown as Session;
      setSession(fakeSession);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setSession(data.session);

    return {
      needsEmailConfirmation: !data.session,
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [session, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
