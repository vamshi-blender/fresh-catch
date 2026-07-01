import {
  ArrowLeft01Icon,
  CancelCircleIcon,
  Home03Icon,
  Search01Icon,
  ShoppingCart01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';

export type BottomNavTab = 'home' | 'cart';

interface BottomNavProps {
  /** Currently selected tab. Defaults to `home` if uncontrolled. */
  activeTab?: BottomNavTab;
  /** Called when a tab is pressed. */
  onTabChange?: (tab: BottomNavTab) => void;
  /** Search field value (optional — leave unset for an uncontrolled field). */
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
  /** Whether the search field is active (focused) — hides the tab pill and expands the field to full width. */
  searchActive?: boolean;
  /** Called when the search field gains focus. */
  onSearchFocus?: () => void;
  /** Called when the back icon is pressed while search is active. */
  onSearchBack?: () => void;
}

const TABS = [
  { key: 'home' as const, icon: Home03Icon },
  { key: 'cart' as const, icon: ShoppingCart01Icon },
];

// Figma reference canvas (same as login.tsx) so the bar scales proportionally
// with the device instead of using fixed pixels — keeps it consistent across
// old/new Androids of different sizes.
const REF_W = 390;
const REF_H = 844;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useNavMetrics(width: number, height: number) {
  return useMemo(() => {
    // Smaller of the two ratios so the bar never overflows either axis; never
    // scales above the reference design, never below 68%.
    const scale = clamp(Math.min(width / REF_W, height / REF_H), 0.68, 1);
    const r = (value: number, min: number, max: number) => Math.round(clamp(value * scale, min, max));
    return {
      iconSize: r(24, 18, 24),
      searchFont: r(16, 13, 16),
      searchPad: r(14, 10, 14),
      searchGap: r(Spacing.two, 6, 8),
      rowGap: r(Spacing.three, 10, 16),
      padTop: r(Spacing.three, 10, 16),
      padH: r(Spacing.four, 14, 24),
      tabBtnPad: r(10, 7, 10),
      tabPillPad: r(Spacing.one, 3, 4),
      tabGap: r(Spacing.one, 3, 4),
    };
  }, [width, height]);
}

/**
 * Floating bottom navigation bar from the Fresh Catch home design (Figma
 * node 127:311): a pill-shaped search field plus a Home/Cart toggle pill.
 *
 * Renders as an absolute overlay pinned to the bottom — it does NOT consume
 * layout space, so the page keeps its full height and content scrolls behind it.
 */
export function BottomNav({
  activeTab = 'home',
  onTabChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchActive = false,
  onSearchFocus,
  onSearchBack,
}: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const m = useNavMetrics(width, height);
  const inputRef = useRef<TextInput>(null);
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab),
  );

  // Measured size of a single tab button — drives the sliding thumb so it stays
  // correct as the scaled padding/icon size changes across devices.
  const [btn, setBtn] = useState({ width: 0, height: 0 });
  const onButtonLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setBtn((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  };

  // Slide the white thumb to the active tab.
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withTiming(activeIndex * (btn.width + m.tabGap), {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, btn.width, m.tabGap, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingTop: m.padTop, paddingHorizontal: m.padH, paddingBottom: Math.max(insets.bottom, Spacing.four) },
      ]}>
      {/* Scrim: transparent at the top, fading to fully opaque at the bottom so
          content scrolling underneath dissolves behind the bar. */}
      <LinearGradient
        colors={['rgba(234,234,234,0)', '#eaeaea']}
        style={[StyleSheet.absoluteFill, styles.noPointer]}
      />

      <Animated.View layout={LinearTransition.duration(220)} style={[styles.row, { gap: m.rowGap }]}>
        <View
          style={[
            styles.searchPill,
            { gap: m.searchGap, paddingVertical: m.searchPad, paddingHorizontal: m.searchPad },
          ]}>
          <Pressable
            onPress={() => {
              if (searchActive) {
                inputRef.current?.blur();
                onSearchBack?.();
              } else {
                inputRef.current?.focus();
              }
            }}
            hitSlop={8}>
            <HugeiconsIcon
              icon={searchActive ? ArrowLeft01Icon : Search01Icon}
              size={m.iconSize}
              color={Brand.placeholder}
            />
          </Pressable>
          <TextInput
            ref={inputRef}
            allowFontScaling={false}
            style={[styles.searchInput, { fontSize: m.searchFont }]}
            placeholder="Search"
            placeholderTextColor={Brand.placeholder}
            value={searchValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            onFocus={onSearchFocus}
            returnKeyType="search"
          />
          {searchActive && !!searchValue && (
            <Pressable
              onPress={() => {
                onSearchChange?.('');
                inputRef.current?.focus();
              }}
              hitSlop={8}>
              <HugeiconsIcon icon={CancelCircleIcon} size={m.iconSize - 4} color={Brand.placeholder} />
            </Pressable>
          )}
        </View>

        {!searchActive && (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)}>
            <LinearGradient
              colors={['#def5ff', '#a2d7ed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.tabPill, { gap: m.tabGap, padding: m.tabPillPad }]}>
              {btn.width > 0 && (
                <Animated.View
                  style={[
                    styles.thumb,
                    { left: m.tabPillPad, top: m.tabPillPad, width: btn.width, height: btn.height },
                    thumbStyle,
                  ]}
                />
              )}
              {TABS.map(({ key, icon }) => {
                const selected = key === activeTab;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onLayout={onButtonLayout}
                    onPress={() => onTabChange?.(key)}
                    style={({ pressed }) => [
                      styles.tabButton,
                      { padding: m.tabBtnPad },
                      pressed && styles.pressed,
                    ]}>
                    <HugeiconsIcon icon={icon} size={m.iconSize} color={Brand.primary} />
                  </Pressable>
                );
              })}
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radius.round,
    // Soft drop shadow (Figma: 2px 8px 4px rgba(158,158,158,0.16)). Uses the
    // cross-platform `boxShadow` string (New Architecture) — the legacy
    // `shadow*` props are deprecated.
    boxShadow: '2px 8px 4px rgba(158, 158, 158, 0.16)',
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: Brand.text,
    // Android adds extra vertical font padding by default; removing it keeps
    // text metrics consistent across Android versions and matches iOS.
    includeFontPadding: false,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.round,
    // Figma node 177:520 — vertical gradient (#def5ff → #a2d7ed). Uses the same
    // soft drop shadow as the search pill.
    boxShadow: '2px 8px 4px rgba(158, 158, 158, 0.16)',
  },
  // Sliding white highlight behind the active tab. Pinned to the pill's inner
  // padding box; its translateX is animated between tab positions.
  thumb: {
    position: 'absolute',
    backgroundColor: Brand.surface,
    borderRadius: Radius.round,
  },
  tabButton: {
    borderRadius: Radius.round,
  },
  pressed: {
    opacity: 0.7,
  },
  noPointer: {
    pointerEvents: 'none',
  },
});
