import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator>
        <Pressable
          onPress={signOut}
          style={({ pressed }) => [
            styles.signOut,
            { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
          ]}>
          <ThemedText type="smallBold">Sign out</ThemedText>
        </Pressable>

        {/* Duplicate this block as many times as you like to simulate a long page. */}
        <ThemedText type="subtitle" style={styles.text}>
          Section title
        </ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>
        <ThemedText style={styles.text}>{LOREM}</ThemedText>

        {Platform.OS === 'web' && <WebBadge />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  signOut: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.two,
  },
});
