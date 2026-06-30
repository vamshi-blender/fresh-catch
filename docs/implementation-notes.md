# Implementation Notes

A living reference of patterns, decisions, and gotchas discovered during development.
**Always read this before implementing UI screens or navigation.**

---

## 1. Keyboard Avoiding — Bottom Buttons Must Stay Above Keyboard

**Rule:** Any screen that has a primary action button pinned to the bottom AND contains a `TextInput` must wrap its entire layout in a `KeyboardAvoidingView`.

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  {/* back button / header */}
  {/* content */}
  <View style={{ flex: 1 }} />   {/* spacer pushes button to bottom */}
  {/* bottom bar with primary button */}
</KeyboardAvoidingView>
```

- Use `behavior="padding"` on iOS, `behavior="height"` on Android.
- The spacer `<View style={{ flex: 1 }} />` between content and the bottom bar is what makes the button float to the bottom and then ride up with the keyboard.
- Forgetting `KeyboardAvoidingView` means the keyboard overlaps the button — the user must dismiss the keyboard before tapping it.

**Applies to:** `phone-login.tsx`, `otp-verify.tsx`, and any future screen with a pinned bottom CTA and inputs.

---

## 2. Gradient Background — Use a Fixed-Height View, Not `absoluteFill` + `locations`

**Rule:** Do NOT use `StyleSheet.absoluteFill` with `locations` to fade a gradient partway down the screen. On Android the gradient renderer behaves differently and the fade extends much further than intended.

**Wrong:**
```tsx
<LinearGradient
  colors={['#a8daf3', '#ffffff']}
  locations={[0, 0.649]}          // ❌ extends 65% down on Android
  style={StyleSheet.absoluteFill}
/>
```

**Correct:** Size the gradient view to exactly the height it should cover, let the white `backgroundColor` on the root `View` handle the rest.

```tsx
// Root view has backgroundColor: '#ffffff'
<LinearGradient
  colors={['#a8daf3', '#ffffff']}
  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.28 }}
  pointerEvents="none"
/>
```

- The `0.28` (28%) comes from the Figma spec: `to-[27.835%]`.
- This renders identically on iOS and Android.

**Applies to:** `phone-login.tsx`, `otp-verify.tsx`, and any future screen using the same blue-to-white auth gradient.

---

## 3. Stack Navigation Transitions — Disable Animation for Auth Screens

**Rule:** Auth flow screens (`phone-login`, `otp-verify`, etc.) must be registered in `_layout.tsx` with `animation: 'none'` to avoid the default slide-in transition.

```tsx
// src/app/_layout.tsx
<Stack.Protected guard={!isAuthenticated}>
  <Stack.Screen name="login" />
  <Stack.Screen name="phone-login" options={{ animation: 'none' }} />
  <Stack.Screen name="otp-verify" options={{ animation: 'none' }} />
</Stack.Protected>
```

- Without an explicit `Stack.Screen` entry, Expo Router uses the file-based fallback with a default push animation — visible as a slide-from-right transition.
- All new auth screens added under `src/app/` must be registered here with `animation: 'none'`.

---

## 4. Phone Number Input — Format and Validation

**Rule:** The phone input field on `phone-login.tsx` is India-only (+91). The input is split into two parts:

- A static `+91` label (not editable) on the left with a vertical divider
- A `TextInput` on the right

Formatting logic — strip non-digits, cap at 10, insert space after 5th digit:

```ts
function handlePhoneChange(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 10);
  const formatted = digits.length > 5
    ? `${digits.slice(0, 5)} ${digits.slice(5)}`
    : digits;
  setPhone(formatted);
}
```

The Continue button enables only when exactly 10 digits are entered:

```ts
const enabled = phone.replace(/\s/g, '').length === 10;
```

Placeholder text: `98765 43210`.
