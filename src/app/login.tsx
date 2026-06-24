import Ionicons from '@expo/vector-icons/Ionicons';
import { SmartPhone01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

// Login-screen-only tokens (Figma frame 111:205)
const C = {
  gradientTop: '#a8daf3',
  gradientBottom: '#ffffff',
  tileOverlay: 'rgba(255,255,255,0.12)',
  heading: '#222731',
  pillBg: '#ebf5ff',
  linkBlue: '#4285f4',
} as const;

const F = {
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────
const TILES = [
  require('@/assets/images/auth/tiles/tile1.png'),
  require('@/assets/images/auth/tiles/tile2.png'),
  require('@/assets/images/auth/tiles/tile3.png'),
  require('@/assets/images/auth/tiles/tile4.png'),
  require('@/assets/images/auth/tiles/tile5.png'),
];
const LOGIN_LOGO = require('@/assets/images/auth/logo-login.png');
const GOOGLE_ICON = require('@/assets/images/auth/google-logo.svg');

// ─── Figma reference canvas ───────────────────────────────────────────────────
const REF_W = 390;
const REF_H = 844;
const REF_TILE = 77.8;
const REF_GAP = 25.93;

// Row 2 sparse tile positions from Figma
const ROW2: { left: number; idx: number }[] = [
  { left: 8, idx: 0 },
  { left: 305, idx: 3 },
  { left: 425.93, idx: 4 },
];

// ─── Responsive metrics ───────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function px(value: number) {
  return Math.round(value);
}

type LoginMetrics = {
  // Tile / logo layout (scales from width only — absolute positioned)
  tileSize: number;
  tileGap: number;
  logoWidth: number;
  logoHeight: number;
  logoTop: number;
  logoLeft: number;
  sheetTop: number;
  // Sheet / form (scales from the smaller of width or height, clamped)
  sheetPadding: number;
  sectionGap: number;
  fieldGap: number;
  fieldHeight: number;
  fieldRadius: number;
  headingSize: number;
  headingLineHeight: number;
  inputSize: number;
  bodySize: number;
  smallSize: number;
  pillPaddingH: number;
  pillPaddingV: number;
  socialGap: number;
  socialBtnGap: number;
  socialBtnPadding: number;
  socialBtnRadius: number;
  iconSize: number;
};

function useLoginMetrics(width: number, height: number): LoginMetrics {
  return useMemo(() => {
    // Use the smaller of the two ratios so the design never overflows either axis.
    // Clamp: never scale up beyond the reference design, never below 68%.
    const scale = clamp(Math.min(width / REF_W, height / REF_H), 0.68, 1);

    // Tile scaling is purely width-driven (they're absolutely positioned)
    const tileScale = width / REF_W;
    const tileSize = px(REF_TILE * tileScale);
    const tileGap = px(REF_GAP * tileScale);
    const logoWidth = px(clamp(181 * tileScale, 104, 181));
    const logoHeight = px(clamp(70 * tileScale, 40, 70));

    return {
      tileSize,
      tileGap,
      logoWidth,
      logoHeight,
      logoTop: px(148 * tileScale),
      logoLeft: px((width - logoWidth) / 2),
      sheetTop: height * (366 / 844),
      sheetPadding: px(clamp(24 * scale, 14, 24)),
      sectionGap: px(clamp(16 * scale, 10, 16)),
      fieldGap: px(clamp(16 * scale, 8, 16)),
      fieldHeight: px(clamp(52 * scale, 40, 52)),
      fieldRadius: px(clamp(10 * scale, 8, 10)),
      headingSize: px(clamp(28 * scale, 20, 28)),
      headingLineHeight: px(clamp(36 * scale, 25, 36)),
      inputSize: px(clamp(16 * scale, 13, 16)),
      bodySize: px(clamp(16 * scale, 13, 16)),
      smallSize: px(clamp(14 * scale, 11, 14)),
      pillPaddingH: px(clamp(8 * scale, 5, 8)),
      pillPaddingV: px(clamp(5 * scale, 3, 5)),
      socialGap: px(clamp(16 * scale, 8, 16)),
      socialBtnGap: px(clamp(10 * scale, 6, 10)),
      socialBtnPadding: px(clamp(16 * scale, 9, 16)),
      socialBtnRadius: px(clamp(16 * scale, 10, 16)),
      iconSize: px(clamp(20 * scale, 16, 20)),
    };
  }, [width, height]);
}

// ─── Validation ──────────────────────────────────────────────────────────────
const MIN_PW = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'sign-in' | 'sign-up';

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const m = useLoginMetrics(width, height);

  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === 'sign-up';

  function switchMode() {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError(null);
    setNotice(null);
  }

  async function handleSubmit() {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) return setError('Enter a valid email address.');
    if (password.length < MIN_PW)
      return setError(`Password must be at least ${MIN_PW} characters.`);
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp(normalized, password);
        if (result.needsEmailConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('sign-in');
        }
      } else {
        await signIn(normalized, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* ── Full-screen gradient background ── */}
      <LinearGradient
        colors={[C.gradientTop, C.gradientBottom]}
        locations={[0, 0.649]}
        style={StyleSheet.absoluteFill}>
        {/* Tile row 1 */}
        {TILES.map((src, i) => (
          <Image
            key={`r1-${i}`}
            source={src}
            style={[
              styles.tile,
              {
                left: -43 * (width / REF_W) + i * (m.tileSize + m.tileGap),
                top: px(40 * (width / REF_W)),
                width: m.tileSize,
                height: m.tileSize,
              },
            ]}
            contentFit="contain"
          />
        ))}

        {/* Tile row 2: sparse tiles flanking the logo */}
        {ROW2.map(({ left, idx }, i) => (
          <Image
            key={`r2-${i}`}
            source={TILES[idx]}
            style={[
              styles.tile,
              {
                left: px(left * (width / REF_W)),
                top: px(143.73 * (width / REF_W)),
                width: m.tileSize,
                height: m.tileSize,
              },
            ]}
            contentFit="contain"
          />
        ))}

        {/* Tile row 3 */}
        {TILES.map((src, i) => (
          <Image
            key={`r3-${i}`}
            source={src}
            style={[
              styles.tile,
              {
                left: -116 * (width / REF_W) + i * (m.tileSize + m.tileGap),
                top: px(247.47 * (width / REF_W)),
                width: m.tileSize,
                height: m.tileSize,
              },
            ]}
            contentFit="contain"
          />
        ))}

        {/* Translucent overlay on background section */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { bottom: height - m.sheetTop, backgroundColor: C.tileOverlay },
          ]}
        />

        {/* Logo */}
        <Image
          source={LOGIN_LOGO}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: m.logoTop,
            left: m.logoLeft,
            width: m.logoWidth,
            height: m.logoHeight,
          }}
          contentFit="contain"
        />
      </LinearGradient>

      {/* ── Bottom sheet ── */}
      <KeyboardAvoidingView
        style={[StyleSheet.absoluteFill, { top: m.sheetTop }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={[
              styles.sheetContent,
              {
                padding: m.sheetPadding,
                gap: m.sectionGap,
                paddingBottom: Math.max(insets.bottom + 8, m.sheetPadding),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Heading */}
            <Text
              allowFontScaling={false}
              style={[
                styles.heading,
                { fontSize: m.headingSize, lineHeight: m.headingLineHeight },
              ]}>
              {isSignUp ? 'Create an\naccount' : 'Enter your mail\naddress'}
            </Text>

            {/* Input group */}
            <View style={{ gap: m.fieldGap }}>
              {/* Email */}
              <View
                style={[
                  styles.inputWrap,
                  { height: m.fieldHeight, borderRadius: m.fieldRadius },
                ]}>
                <TextInput
                  allowFontScaling={false}
                  style={[styles.input, { fontSize: m.inputSize }]}
                  placeholder="Enter Email ID"
                  placeholderTextColor={Brand.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  inputMode="email"
                  editable={!submitting}
                />
              </View>

              {/* Password */}
              <View
                style={[
                  styles.inputWrap,
                  styles.inputRow,
                  { height: m.fieldHeight, borderRadius: m.fieldRadius },
                ]}>
                <TextInput
                  allowFontScaling={false}
                  style={[styles.input, styles.inputFlex, { fontSize: m.inputSize }]}
                  placeholder="Password"
                  placeholderTextColor={Brand.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  textContentType={isSignUp ? 'newPassword' : 'password'}
                  editable={!submitting}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={m.iconSize}
                    color={Brand.placeholder}
                  />
                </Pressable>
              </View>


              {/* Mode toggle */}
              <View style={styles.toggleRow}>
                <Text
                  allowFontScaling={false}
                  style={[styles.toggleText, { fontSize: m.smallSize }]}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <Pressable
                  style={[
                    styles.togglePill,
                    { paddingHorizontal: m.pillPaddingH, paddingVertical: m.pillPaddingV },
                  ]}
                  onPress={switchMode}
                  disabled={submitting}>
                  <Text
                    allowFontScaling={false}
                    style={[styles.togglePillText, { fontSize: m.smallSize }]}>
                    {isSignUp ? 'Sign-In' : 'Sign-Up'}
                  </Text>
                </Pressable>
              </View>

              {error ? (
                <Text
                  allowFontScaling={false}
                  style={[styles.feedbackError, { fontSize: m.smallSize }]}>
                  {error}
                </Text>
              ) : null}
              {notice ? (
                <Text
                  allowFontScaling={false}
                  style={[styles.feedbackNotice, { fontSize: m.smallSize }]}>
                  {notice}
                </Text>
              ) : null}
            </View>

            {/* "or" divider */}
            <Text
              allowFontScaling={false}
              style={[styles.orDivider, { fontSize: m.bodySize }]}>
              or
            </Text>

            {/* Social buttons */}
            <View style={[styles.socialRow, { gap: m.socialGap }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  {
                    gap: m.socialBtnGap,
                    padding: m.socialBtnPadding,
                    borderRadius: m.socialBtnRadius,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google">
                <View style={{ width: m.iconSize, height: m.iconSize, padding: 1 }}>
                  <Image
                    source={GOOGLE_ICON}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.socialLabel, { fontSize: m.bodySize }]}>
                  Google
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  {
                    gap: m.socialBtnGap,
                    padding: m.socialBtnPadding,
                    borderRadius: m.socialBtnRadius,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Mobile">
                <HugeiconsIcon icon={SmartPhone01Icon} size={m.iconSize} color={Brand.muted} />
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.socialLabel, { fontSize: m.bodySize }]}>
                  Mobile
                </Text>
              </Pressable>
            </View>

            {/* Continue CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.continueBtn,
                { height: m.fieldHeight, borderRadius: m.fieldRadius + 4 },
                (pressed || submitting) && styles.pressed,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button">
              <Text
                allowFontScaling={false}
                style={[styles.continueBtnText, { fontSize: m.bodySize }]}>
                {submitting ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Continue'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tile: {
    position: 'absolute',
    opacity: 0.72,
    borderRadius: 13,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetContent: {
    flexGrow: 1,
  },
  heading: {
    fontFamily: F.bold,
    color: C.heading,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: F.medium,
    color: '#333333',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  inputFlex: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  toggleText: {
    fontFamily: F.medium,
    color: Brand.muted,
    includeFontPadding: false,
  },
  togglePill: {
    backgroundColor: C.pillBg,
    borderRadius: 30,
  },
  togglePillText: {
    fontFamily: F.medium,
    color: C.linkBlue,
    includeFontPadding: false,
  },
  feedbackError: {
    fontFamily: F.medium,
    color: '#e5484d',
    includeFontPadding: false,
  },
  feedbackNotice: {
    fontFamily: F.medium,
    color: Brand.primary,
    includeFontPadding: false,
  },
  orDivider: {
    fontFamily: F.medium,
    color: Brand.muted,
    textAlign: 'center',
    includeFontPadding: false,
  },
  socialRow: {
    flexDirection: 'row',
  },
  socialBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Brand.border,
  },
  socialLabel: {
    minWidth: 0,
    flexShrink: 1,
    fontFamily: F.medium,
    color: Brand.muted,
    includeFontPadding: false,
  },
  continueBtn: {
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontFamily: F.semiBold,
    color: '#ffffff',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.72,
  },
});
