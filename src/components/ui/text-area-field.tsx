import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Brand, ControlSize, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';

export type TextAreaFieldProps = Omit<TextInputProps, 'multiline'> & {
  /** Label rendered above the field. */
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Multiline text area field for longer free-form answers. */
export function TextAreaField({
  label,
  containerStyle,
  style,
  editable = true,
  ...rest
}: TextAreaFieldProps) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        multiline
        style={[styles.input, !editable && styles.disabled, style]}
        editable={editable}
        placeholderTextColor={Brand.placeholder}
        textAlignVertical="top"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Brand.text,
    marginBottom: Spacing.two,
  },
  input: {
    minHeight: ControlSize.textArea,
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Brand.text,
  },
  disabled: {
    opacity: 0.6,
  },
});
