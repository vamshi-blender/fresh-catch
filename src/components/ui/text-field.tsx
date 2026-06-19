import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Brand, Fonts } from '@/constants/theme';

export type TextFieldProps = TextInputProps & {
  /** Label rendered above the field. */
  label?: string;
  /**
   * When true, the text is masked and a show/hide eye toggle is rendered.
   * Use this instead of `secureTextEntry` for password fields.
   */
  password?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Labeled, bordered text input from the design system. Handles its own
 * show/hide state for password fields via the `password` prop.
 */
export function TextField({
  label,
  password = false,
  containerStyle,
  style,
  editable = true,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.field, !editable && styles.disabled]}>
        <TextInput
          style={[styles.input, style]}
          editable={editable}
          placeholderTextColor={Brand.placeholder}
          secureTextEntry={password && hidden}
          {...rest}
        />

        {password ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Brand.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  field: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#000000',
  },
});
