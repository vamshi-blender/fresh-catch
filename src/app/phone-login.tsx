import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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

// ─── Screen-local design tokens (Figma frame 73:95) ──────────────────────────
const C = {
  gradientTop: '#a8daf3',
  gradientBottom: '#ffffff',
  heading: '#222731',
  continueBg: '#f6f6f6',
  continueText: '#7a7d84',
} as const;

const F = {
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

// ─── Responsive helpers ───────────────────────────────────────────────────────
const REF_W = 390;
const REF_H = 844;

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
  fieldHeight: number;
  fieldRadius: number;
  inputSize: number;
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
      fieldHeight: px(clamp(52 * scale, 40, 52)),
      fieldRadius: px(clamp(10 * scale, 8, 10)),
      inputSize: px(clamp(16 * scale, 13, 16)),
      sectionPadding: px(clamp(24 * scale, 16, 24)),
      bottomBtnHeight: px(clamp(56 * scale, 44, 56)),
      bottomBtnRadius: px(clamp(16 * scale, 12, 16)),
    };
  }, [width, height]);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function PhoneLoginScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const m = useMetrics(width, height);

  const [phone, setPhone] = useState('');
  const enabled = phone.replace(/\s/g, '').length === 10;

  function handlePhoneChange(text: string) {
    // Strip non-digits, cap at 10
    const digits = text.replace(/\D/g, '').slice(0, 10);
    // Insert space after 5th digit: "12345 67890"
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
    setPhone(formatted);
  }

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
        {/* ── Content area ── */}
        <View
          style={[
            styles.content,
            {
              paddingTop: m.topPadding + insets.top,
              paddingHorizontal: m.sectionPadding,
              gap: m.contentGap,
            },
          ]}>
          {/* Close (×) button — top-right */}
          <View style={styles.closeRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color={C.heading} />
            </Pressable>
          </View>

          {/* Heading + subtitle */}
          <View style={{ gap: px(12 * m.scale) }}>
            <Text
              allowFontScaling={false}
              style={[
                styles.heading,
                { fontSize: m.headingSize, lineHeight: m.headingLineHeight },
              ]}>
              {'Enter your mobile\nnumber'}
            </Text>
            <Text
              allowFontScaling={false}
              style={[
                styles.subtitle,
                { fontSize: m.bodySize, lineHeight: m.bodyLineHeight },
              ]}>
              {'By entering your mobile number you\ncan log in'}
            </Text>
          </View>

          {/* Input group */}
          <View style={{ gap: px(16 * m.scale) }}>
            <View
              style={[
                styles.inputWrap,
                { height: m.fieldHeight, borderRadius: m.fieldRadius },
              ]}>
              {/* Static +91 prefix */}
              <Text
                allowFontScaling={false}
                style={[styles.prefix, { fontSize: m.inputSize }]}>
                +91
              </Text>
              <View style={styles.divider} />
              {/* Phone number input */}
              <TextInput
                allowFontScaling={false}
                style={[styles.input, { fontSize: m.inputSize }]}
                placeholder="98765 43210"
                placeholderTextColor={Brand.placeholder}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </View>
          </View>
        </View>

        {/* ── Spacer so Continue stays at the bottom ── */}
        <View style={{ flex: 1 }} />

        {/* ── Continue button ── */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom + 8, 16), paddingHorizontal: m.sectionPadding },
          ]}>
          <Pressable
            disabled={!enabled}
            onPress={() => router.push({ pathname: '/otp-verify', params: { phone } })}
            style={({ pressed }) => [
              styles.continueBtn,
              enabled && styles.continueBtnEnabled,
              { height: m.bottomBtnHeight, borderRadius: m.bottomBtnRadius },
              pressed && enabled && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue">
            <Text
              allowFontScaling={false}
              style={[
                styles.continueBtnText,
                { fontSize: m.bodySize },
                enabled && styles.continueBtnTextEnabled,
              ]}>
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  kav: {
    flex: 1,
  },
  content: {
    flexShrink: 0,
  },
  closeRow: {
    alignItems: 'flex-end',
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
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
  inputWrap: {
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefix: {
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#333333',
    includeFontPadding: false,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 12,
    backgroundColor: Brand.border,
  },
  input: {
    flex: 1,
    fontFamily: F.medium,
    color: '#333333',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  bottomBar: {
    paddingTop: 8,
  },
  continueBtn: {
    backgroundColor: C.continueBg,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnEnabled: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  continueBtnText: {
    fontFamily: F.semiBold,
    color: C.continueText,
    includeFontPadding: false,
  },
  continueBtnTextEnabled: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.72,
  },
});
