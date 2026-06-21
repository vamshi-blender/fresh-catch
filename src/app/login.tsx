import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Brand, ControlSize, FontSize, Fonts, LineHeight, Spacing } from '@/constants/theme';
import { AuthFormRenderer } from '@/features/auth/auth-form-renderer';
import { type AuthFieldId } from '@/features/auth/auth-form-schema';
import { useAuthFormSchema } from '@/features/auth/use-auth-form-schema';
import { useAuth } from '@/hooks/use-auth';

const logo = require('@/assets/images/auth/logo.png');
const googleIcon = require('@/assets/images/auth/google.png');
const facebookIcon = require('@/assets/images/auth/facebook.png');

type Mode = 'sign-up' | 'sign-in';

// Basic client-side checks only — the server remains the source of truth
// (OWASP Authentication Cheat Sheet).
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { schema } = useAuthFormSchema();

  const [mode, setMode] = useState<Mode>('sign-up');
  const [fieldValues, setFieldValues] = useState<Record<AuthFieldId, string>>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === 'sign-up';

  function switchMode() {
    setMode((m) => (m === 'sign-up' ? 'sign-in' : 'sign-up'));
    setError(null);
    setNotice(null);
  }

  function setFieldValue(fieldId: AuthFieldId, value: string) {
    setFieldValues((current) => ({ ...current, [fieldId]: value }));
  }

  function validateSignUpFields() {
    for (const field of schema.signUp.fields) {
      const value = fieldValues[field.id] ?? '';

      if (field.required && !value.trim()) {
        return `Enter ${field.label.toLowerCase()}.`;
      }
      if (field.minLength && value.length < field.minLength) {
        return `${field.label} must be at least ${field.minLength} characters.`;
      }
      if (field.matches && value !== fieldValues[field.matches]) {
        return `${field.label} does not match.`;
      }
    }

    return null;
  }

  async function handleSubmit() {
    const normalizedEmail = fieldValues.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return setError('Enter a valid email address.');
    }
    if (!isSignUp && fieldValues.password.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (isSignUp) {
      const validationError = validateSignUpFields();
      if (validationError) return setError(validationError);
    }
    if (isSignUp && !agreed) {
      return setError('Please agree to the User Agreement and Privacy Policy.');
    }

    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp(normalizedEmail, fieldValues.password);
        if (result.needsEmailConfirmation) {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('sign-in');
        }
      } else {
        await signIn(normalizedEmail, fieldValues.password);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Image source={logo} style={styles.logo} contentFit="contain" />

            <Text style={styles.heading}>
              {isSignUp ? schema.signUp.title : 'Welcome back'}
            </Text>

            <View style={styles.fields}>
              {isSignUp ? (
                <AuthFormRenderer
                  fields={schema.signUp.fields}
                  values={fieldValues}
                  onChangeValue={setFieldValue}
                  editable={!submitting}
                />
              ) : (
                <>
                  <TextField
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={fieldValues.email}
                    onChangeText={(value) => setFieldValue('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    inputMode="email"
                    editable={!submitting}
                  />

                  <TextField
                    label="Password"
                    placeholder="Enter your password"
                    value={fieldValues.password}
                    onChangeText={(value) => setFieldValue('password', value)}
                    password
                    autoCapitalize="none"
                    autoComplete="current-password"
                    textContentType="password"
                    editable={!submitting}
                  />
                </>
              )}
            </View>

            {isSignUp && (
              <Pressable
                style={styles.termsRow}
                onPress={() => setAgreed((a) => !a)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreed }}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Ionicons name="checkmark" size={16} color={Brand.onPrimary} />}
                </View>
                <Text style={styles.termsText}>
                  I’ve read and agreed to <Text style={styles.termsLink}>User Agreement</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Pressable>
            )}

            {error && <Text style={styles.error}>{error}</Text>}
            {notice && <Text style={styles.notice}>{notice}</Text>}

            <Button
              label={isSignUp ? schema.signUp.submitLabel : 'Sign in'}
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submit}
            />

            <Text style={styles.divider}>other way to sign in</Text>

            <View style={styles.socialRow}>
              <SocialButton source={googleIcon} label="Sign in with Google" />
              <SocialButton source={facebookIcon} label="Sign in with Facebook" />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Pressable onPress={switchMode} disabled={submitting} hitSlop={8}>
                <Text style={styles.footerLink}>{isSignUp ? 'Back to Sign In' : 'Sign up'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// Social sign-in is decorative for now — wire OAuth (e.g. expo-auth-session)
// to these later.
function SocialButton({ source, label }: { source: number; label: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Image source={source} style={styles.socialIcon} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.surface,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    alignItems: 'center',
  },
  logo: {
    width: 103,
    height: 81,
  },
  heading: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.heading,
    fontWeight: '600',
    color: Brand.primary,
    textAlign: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
  },
  fields: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  termsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  checkbox: {
    width: ControlSize.checkbox,
    height: ControlSize.checkbox,
    borderRadius: ControlSize.checkbox / 2,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  termsText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    fontWeight: '500',
    color: Brand.muted,
    lineHeight: LineHeight.body,
  },
  termsLink: {
    fontWeight: '600',
    color: Brand.primary,
  },
  error: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
    color: Brand.danger,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
  },
  notice: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
    color: Brand.primary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
  },
  submit: {
    alignSelf: 'stretch',
    marginTop: Spacing.five,
  },
  divider: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.xsmall,
    color: Brand.muted,
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  socialButton: {
    width: ControlSize.icon,
    height: ControlSize.icon,
  },
  socialButtonPressed: {
    opacity: 0.7,
  },
  socialIcon: {
    width: ControlSize.icon,
    height: ControlSize.icon,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.six,
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.xsmall,
    color: Brand.muted,
  },
  footerLink: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.xsmall,
    fontWeight: '600',
    color: Brand.primary,
  },
});
