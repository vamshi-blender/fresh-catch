import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Brand, FontSize, Fonts, LineHeight, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: FontSize.body,
    lineHeight: LineHeight.body,
    fontWeight: 700,
  },
  default: {
    fontSize: FontSize.default,
    lineHeight: LineHeight.default,
    fontWeight: 500,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 600,
    lineHeight: LineHeight.title,
  },
  subtitle: {
    fontSize: FontSize.subtitle,
    lineHeight: LineHeight.subtitle,
    fontWeight: 600,
  },
  link: {
    lineHeight: LineHeight.link,
    fontSize: FontSize.body,
  },
  linkPrimary: {
    lineHeight: LineHeight.link,
    fontSize: FontSize.body,
    color: Brand.primary,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: FontSize.xsmall,
  },
});
