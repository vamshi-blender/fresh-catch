import '@/global.css';

import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';

// Client-side route protection. When guards flip, Expo Router automatically
// redirects to the first available screen — no manual navigation needed. See:
// https://docs.expo.dev/router/advanced/protected/
function RootNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: prefsLoading } = usePreferences();

  // Wait for auth restore. For authenticated users, also wait for preferences
  // so we never briefly flash the wrong screen.
  if (authLoading || (isAuthenticated && prefsLoading)) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main app — authenticated users who have completed onboarding.
          `index` is the standalone landing screen at `/` (no tab bar) and acts
          as the anchor route; `(app)` holds the tab navigator (e.g. /explore). */}
      <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      {/* Onboarding — authenticated first-time users. */}
      <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
        <Stack.Screen name="preferences" />
      </Stack.Protected>

      {/* Auth — unauthenticated users. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="phone-login" options={{ animation: 'none' }} />
        <Stack.Screen name="otp-verify" options={{ animation: 'none' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFonts({ PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold });
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <PreferencesProvider>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
