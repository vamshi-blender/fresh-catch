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
import { TextAreaField } from '@/components/ui/text-area-field';
import { Brand, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { usePreferences } from '@/hooks/use-preferences';

const logo = require('@/assets/images/auth/logo.png');

const DIET_OPTIONS = [
  'None',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Keto',
  'Gluten-free',
  'Halal',
  'Kosher',
] as const;

export default function PreferencesScreen() {
  const { savePreferences } = usePreferences();

  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [dietPreferences, setDietPreferences] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleDiet(option: string) {
    setDietPreferences((prev) =>
      prev.includes(option) ? prev.filter((d) => d !== option) : [...prev, option],
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await savePreferences({ likes, dislikes, dietPreferences });
      // Expo Router's protected route guard re-evaluates automatically once
      // `hasCompletedOnboarding` flips to true — no manual navigation needed.
    } finally {
      setSaving(false);
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

            <Text style={styles.heading}>Tell us about yourself</Text>
            <Text style={styles.subheading}>
              Help us personalise your Fresh Catch experience.
            </Text>

            <View style={styles.fields}>
              <TextAreaField
                label="What do you like?"
                placeholder="e.g. Salmon, Tuna, Prawns…"
                value={likes}
                onChangeText={setLikes}
                autoCapitalize="sentences"
                autoCorrect
                editable={!saving}
              />

              <TextAreaField
                label="What do you dislike?"
                placeholder="e.g. Shellfish, Squid…"
                value={dislikes}
                onChangeText={setDislikes}
                autoCapitalize="sentences"
                autoCorrect
                editable={!saving}
              />

              <View>
                <Text style={styles.fieldLabel}>Diet preferences</Text>
                <View style={styles.chips}>
                  {DIET_OPTIONS.map((option) => {
                    const selected = dietPreferences.includes(option);
                    return (
                      <Pressable
                        key={option}
                        onPress={() => toggleDiet(option)}
                        disabled={saving}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={option}
                        style={({ pressed }) => [
                          styles.chip,
                          selected && styles.chipSelected,
                          pressed && styles.chipPressed,
                        ]}>
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <Button
              label="Save preferences"
              onPress={handleSave}
              loading={saving}
              style={styles.saveButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  },
  subheading: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Brand.muted,
    textAlign: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.five,
  },
  fields: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Brand.text,
    marginBottom: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  chipSelected: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.small,
    fontWeight: '500',
    color: Brand.muted,
  },
  chipTextSelected: {
    color: Brand.onPrimary,
  },
  saveButton: {
    alignSelf: 'stretch',
    marginTop: Spacing.five,
  },
});
