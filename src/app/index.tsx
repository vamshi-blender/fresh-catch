import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, BottomNavTab } from '@/components/bottom-nav';
import { SearchResults } from '@/components/search-results';
import { ThemedText } from '@/components/themed-text';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

export default function HomeScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [searchValue, setSearchValue] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const handleSearchBack = () => {
    setSearchActive(false);
    setSearchValue('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {searchActive ? (
          <SearchResults contentBottomPadding={insets.bottom + 96} />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
            showsVerticalScrollIndicator>
            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.signOut,
                { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText allowFontScaling={false} type="smallBold" style={styles.text}>
                Sign out
              </ThemedText>
            </Pressable>

            {/* Duplicate this block as many times as you like to simulate a long page. */}
            <ThemedText allowFontScaling={false} type="subtitle" style={styles.text}>
              Section title
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>
            <ThemedText allowFontScaling={false} style={styles.text}>
              {LOREM}
            </ThemedText>

            {Platform.OS === 'web' && <WebBadge />}
          </ScrollView>
        )}

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchActive={searchActive}
          onSearchFocus={() => setSearchActive(true)}
          onSearchBack={handleSearchBack}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  text: {
    color: '#000000',
    // Android adds extra vertical font padding by default; removing it keeps
    // text metrics consistent across Android versions and matches iOS.
    includeFontPadding: false,
  },
  signOut: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.two,
  },
  signOutText: {
    color: '#000000',
  },
});
