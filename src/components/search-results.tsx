import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';

interface SearchResultsProps {
  contentBottomPadding: number;
}

const FILTER_ROWS = [
  ['Fish', 'Categories', 'Top Deals'],
  ["Today's Catch", 'Best Sellers', 'Prawns'],
];

const RECOMMENDED_ROWS = 2;
const RECOMMENDED_PER_ROW = 5;
const TOP_CHOICE_COUNT = 5;

/**
 * Placeholder search screen from the Fresh Catch design (Figma node 185:332):
 * filter chips, a recommended-items avatar grid, and a top-choice card list —
 * all rendered as skeleton blocks until real search results are wired up.
 */
export function SearchResults({ contentBottomPadding }: SearchResultsProps) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator>
      <View style={styles.filters}>
        {FILTER_ROWS.map((row, i) => (
          <View key={i} style={styles.filterRow}>
            {row.map((label) => (
              <View key={label} style={styles.chip}>
                <ThemedText allowFontScaling={false} style={styles.chipText}>
                  {label}
                </ThemedText>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText allowFontScaling={false} style={styles.sectionLabel}>
          RECOMMENDED ITEMS
        </ThemedText>
        <View style={styles.avatarRows}>
          {Array.from({ length: RECOMMENDED_ROWS }).map((_, row) => (
            <View key={row} style={styles.avatarRow}>
              {Array.from({ length: RECOMMENDED_PER_ROW }).map((_, i) => (
                <View key={i} style={styles.avatar} />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText allowFontScaling={false} style={styles.sectionLabel}>
          TOP CHOICE
        </ThemedText>
        <View style={styles.topChoiceList}>
          {Array.from({ length: TOP_CHOICE_COUNT }).map((_, i) => (
            <View key={i} style={styles.topChoiceCard} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  filters: {
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Brand.border,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: FontSize.body,
    color: Brand.textTertiary,
  },
  section: {
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: FontSize.body,
    color: Brand.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.56,
  },
  avatarRows: {
    gap: Spacing.four,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.round,
    backgroundColor: Brand.skeleton,
  },
  topChoiceList: {
    gap: 12,
  },
  topChoiceCard: {
    height: 46,
    borderRadius: Radius.small,
    backgroundColor: Brand.skeleton,
  },
});
