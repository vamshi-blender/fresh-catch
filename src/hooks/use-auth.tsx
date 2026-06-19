/**
 * Minimal authentication state for the app.
 *
 * The session token is persisted with `expo-secure-store` on native platforms
 * (iOS Keychain / Android Keystore-encrypted storage) as recommended by the
 * Expo authentication guide: https://docs.expo.dev/develop/authentication/
 *
 * SecureStore is native-only, so we fall back to `localStorage` on web purely
 * so the web build doesn't crash during development. Browser localStorage is
 * NOT secure storage — a real web deployment should use an httpOnly cookie set
 * by the server instead.
 *
 * `signIn`/`signUp` currently call a stubbed request. Swap `fakeAuthRequest`
 * for your real backend (e.g. an Expo API Route) — the contract is simply
 * "return a session token string, or throw on failure".
 */
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';

const TOKEN_KEY = 'freecatch.session';

// Persisted only when the device is unlocked, and never copied to a new device
// via backup. See SecureStore "keychainAccessible" options in the Expo docs.
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key, SECURE_OPTIONS);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
  },
  async remove(key: string) {
    if (Platform.OS === 'web') {
      localStorage?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

type AuthContextValue = {
  /** The persisted session token, or null when signed out. */
  token: string | null;
  isAuthenticated: boolean;
  /** True while the persisted session is being restored on launch. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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

/**
 * Stand-in for a real backend call. Replace with a fetch to your auth endpoint.
 * Throws on "failure" so the screen can surface an error message.
 */
async function fakeAuthRequest(
  mode: 'sign-in' | 'sign-up',
  email: string,
  _password: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  // TODO: send credentials over HTTPS to your server, which verifies/hashes the
  // password and returns a signed session token (JWT). Never trust the client.
  return `demo-token:${mode}:${email}`;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await storage.get(TOKEN_KEY);
        if (active) setToken(stored);
      } catch {
        // Ignore restore failures and treat the user as signed out.
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sessionToken = await fakeAuthRequest('sign-in', email, password);
    await storage.set(TOKEN_KEY, sessionToken);
    setToken(sessionToken);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const sessionToken = await fakeAuthRequest('sign-up', email, password);
    await storage.set(TOKEN_KEY, sessionToken);
    setToken(sessionToken);
  }, []);

  const signOut = useCallback(async () => {
    await storage.remove(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: !!token,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [token, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
