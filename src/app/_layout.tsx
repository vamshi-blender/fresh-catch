import '@/global.css';

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
      {/* Main app — authenticated users who have completed onboarding. */}
      <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      {/* Onboarding — authenticated first-time users. */}
      <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
        <Stack.Screen name="preferences" />
      </Stack.Protected>

      {/* Auth — unauthenticated users. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
