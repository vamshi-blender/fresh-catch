import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Brand, ControlSize, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  /** Shows a spinner and blocks presses. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pill-shaped action button from the design system.
 * `primary` is the filled teal button; `secondary` is an outlined variant.
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (pressed || isDisabled) && styles.dimmed,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? Brand.onPrimary : Brand.primary} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: ControlSize.button,
    borderRadius: Radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  primary: {
    backgroundColor: Brand.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Brand.primary,
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  primaryLabel: {
    color: Brand.onPrimary,
  },
  secondaryLabel: {
    color: Brand.primary,
  },
});
