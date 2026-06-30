import { ArrowLeft02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

const C = {
  gradientTop: '#a8daf3',
  gradientBottom: '#ffffff',
  heading: '#222731',
  mutedText: '#7a7d84',
  resendBg: '#eeeeee',
  resendText: '#999999',
  otpBorder: '#e4e4e4',
  otpText: '#222731',
  continueBg: '#f6f6f6',
  continueText: '#7a7d84',
} as const;

const F = {
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const REF_W = 390;
const REF_H = 844;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
function px(value: number) {
  return Math.round(value);
}

type Metrics = {
  scale: number;
  topPadding: number;
  contentGap: number;
  headingSize: number;
  headingLineHeight: number;
  bodySize: number;
  bodyLineHeight: number;
  smallSize: number;
  otpBoxSize: number;
  otpBoxRadius: number;
  otpFontSize: number;
  sectionPadding: number;
  bottomBtnHeight: number;
  bottomBtnRadius: number;
};

function useMetrics(width: number, height: number): Metrics {
  return useMemo(() => {
    const scale = clamp(Math.min(width / REF_W, height / REF_H), 0.68, 1);
    return {
      scale,
      topPadding: px(clamp(32 * scale, 20, 32)),
      contentGap: px(clamp(32 * scale, 22, 32)),
      headingSize: px(clamp(28 * scale, 20, 28)),
      headingLineHeight: px(clamp(36 * scale, 26, 36)),
      bodySize: px(clamp(16 * scale, 13, 16)),
      bodyLineHeight: px(clamp(24 * scale, 18, 24)),
      smallSize: px(clamp(14 * scale, 11, 14)),
      otpBoxSize: px(clamp(56 * scale, 42, 56)),
      otpBoxRadius: px(clamp(10 * scale, 8, 10)),
      otpFontSize: px(clamp(24 * scale, 18, 24)),
      sectionPadding: px(clamp(24 * scale, 16, 24)),
      bottomBtnHeight: px(clamp(56 * scale, 44, 56)),
      bottomBtnRadius: px(clamp(16 * scale, 12, 16)),
    };
  }, [width, height]);
}

function formatCountdown(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function OtpVerifyScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const m = useMetrics(width, height);
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const filled = digits.filter(Boolean).length;
  const allFilled = filled === OTP_LENGTH;
  const canResend = countdown === 0;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  function handleDigitChange(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    if (!canResend) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  }

  function handleVerify() {
    Keyboard.dismiss();
    // TODO: call OTP verification API with digits.join('')
  }

  const displayPhone = phone ?? '';

  return (
    <View style={styles.root}>
      {/* Gradient covers exactly 28% of screen height — matches Figma's to-[27.835%] */}
      <LinearGradient
        colors={[C.gradientTop, C.gradientBottom]}
        style={[styles.gradient, { height: height * 0.28 }]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Back button ── */}
        <View
          style={[
            styles.topBar,
            { paddingTop: m.topPadding + insets.top, paddingHorizontal: m.sectionPadding },
          ]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <HugeiconsIcon icon={ArrowLeft02Icon} size={px(32 * m.scale)} color={C.heading} />
          </Pressable>
        </View>

        {/* ── Content ── */}
        <View
          style={[
            styles.content,
            { paddingHorizontal: m.sectionPadding, gap: m.contentGap },
          ]}>

          {/* Heading block */}
          <View style={{ gap: px(12 * m.scale) }}>
            <Text
              allowFontScaling={false}
              style={[styles.heading, { fontSize: m.headingSize, lineHeight: m.headingLineHeight }]}>
              Enter OTP
            </Text>
            <View style={{ gap: px(6 * m.scale) }}>
              <Text
                allowFontScaling={false}
                style={[styles.subtitle, { fontSize: m.bodySize, lineHeight: m.bodyLineHeight }]}>
                Enter the 6-digit code sent to
              </Text>
              <View style={styles.phoneRow}>
                <Text
                  allowFontScaling={false}
                  style={[styles.phoneText, { fontSize: m.bodySize, lineHeight: m.bodyLineHeight }]}>
                  +91 {displayPhone}
                </Text>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Edit phone number"
                  style={({ pressed }) => pressed && styles.pressed}>
                  <HugeiconsIcon icon={PencilEdit01Icon} size={px(20 * m.scale)} color={Brand.primary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* OTP boxes */}
          <View style={[styles.otpRow, { gap: px(12 * m.scale) }]}>
            {digits.map((digit, i) => (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  {
                    width: m.otpBoxSize,
                    height: m.otpBoxSize,
                    borderRadius: m.otpBoxRadius,
                    borderColor: focusedIndex === i ? Brand.primary : C.otpBorder,
                  },
                ]}>
                <TextInput
                  ref={(r) => { inputRefs.current[i] = r; }}
                  allowFontScaling={false}
                  style={[styles.otpInput, { fontSize: m.otpFontSize }]}
                  value={digit}
                  onChangeText={(t) => handleDigitChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  onFocus={() => setFocusedIndex(i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textContentType="oneTimeCode"
                  caretHidden
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {/* Resend row */}
          <View style={styles.resendRow}>
            <Text
              allowFontScaling={false}
              style={[styles.resendLabel, { fontSize: m.smallSize }]}>
              Didn't receive the code?
            </Text>
            <Pressable
              onPress={handleResend}
              disabled={!canResend}
              accessibilityRole="button"
              accessibilityLabel={canResend ? 'Resend OTP' : `Resend available in ${countdown}s`}>
              <View
                style={[
                  styles.resendPill,
                  { paddingHorizontal: px(8 * m.scale), paddingVertical: px(4 * m.scale) },
                  canResend && styles.resendPillActive,
                ]}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.resendPillText,
                    { fontSize: m.smallSize },
                    canResend && styles.resendPillTextActive,
                  ]}>
                  {canResend ? 'Resend OTP' : `Resend OTP (${formatCountdown(countdown)})`}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ── Spacer ── */}
        <View style={{ flex: 1 }} />

        {/* ── Verify button ── */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom + 8, 16), paddingHorizontal: m.sectionPadding },
          ]}>
          <Pressable
            disabled={!allFilled}
            onPress={handleVerify}
            style={({ pressed }) => [
              styles.verifyBtn,
              allFilled && styles.verifyBtnEnabled,
              { height: m.bottomBtnHeight, borderRadius: m.bottomBtnRadius },
              pressed && allFilled && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Verify OTP">
            <Text
              allowFontScaling={false}
              style={[
                styles.verifyBtnText,
                { fontSize: m.bodySize },
                allFilled && styles.verifyBtnTextEnabled,
              ]}>
              Verify OTP
            </Text>
          </Pressable>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  kav: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexShrink: 0,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  content: {
    flexShrink: 0,
    marginTop: 16,
  },
  heading: {
    fontFamily: F.bold,
    color: C.heading,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: F.medium,
    color: C.heading,
    includeFontPadding: false,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontFamily: F.medium,
    color: C.heading,
    includeFontPadding: false,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpBox: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontFamily: F.semiBold,
    color: C.otpText,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
    paddingVertical: 0,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  resendLabel: {
    fontFamily: F.medium,
    color: C.mutedText,
    includeFontPadding: false,
  },
  resendPill: {
    backgroundColor: C.resendBg,
    borderRadius: 30,
  },
  resendPillActive: {
    backgroundColor: '#ebf5ff',
  },
  resendPillText: {
    fontFamily: F.semiBold,
    color: C.resendText,
    includeFontPadding: false,
  },
  resendPillTextActive: {
    color: Brand.primary,
  },
  bottomBar: {
    paddingTop: 8,
  },
  verifyBtn: {
    backgroundColor: C.continueBg,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnEnabled: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  verifyBtnText: {
    fontFamily: F.semiBold,
    color: C.continueText,
    includeFontPadding: false,
  },
  verifyBtnTextEnabled: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.72,
  },
});
