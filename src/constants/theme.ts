/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Brand palette from the design system (Figma). These are fixed brand colors,
 * not theme-dependent, so they live separately from the light/dark `Colors`.
 */
export const Brand = {
  /** Primary blue — buttons, checkboxes, links. */
  primary: '#1c77a0',
  text: '#000000',
  /** Text/icon color on top of `primary`. */
  onPrimary: '#FFFFFF',
  /** Input/card borders. */
  border: '#e4e4e4',
  /** Placeholder and hint text. */
  placeholder: '#7a7d84',
  /** Muted secondary text. */
  muted: '#7a7d84',
  danger: '#e5484d',
  /** Field and screen backgrounds. */
  surface: '#FFFFFF',
} as const;


export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const FontSize = {
  xsmall: 12,
  small: 13,
  body: 14,
  default: 16,
  heading: 20,
  subtitle: 32,
  title: 48,
} as const;

export const LineHeight = {
  body: 20,
  default: 24,
  link: 30,
  subtitle: 44,
  title: 52,
} as const;

export const Radius = {
  small: Spacing.two,
  medium: Spacing.three,
  round: 100,
} as const;

export const ControlSize = {
  icon: 48,
  input: 48,
  textArea: 96,
  button: 48,
  checkbox: 24,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
