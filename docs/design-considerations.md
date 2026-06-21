Fresh Catch — Design System Foundation: Recommendations
1. Requirements analysis (what this product actually needs)
Product type: Online seafood delivery — a transactional, photo-heavy commerce app. That drives a few specific needs your foundation must support up front:

Product imagery is the hero. Seafood sells on freshness and appetite appeal. The system needs defined image treatments (aspect ratios, corner radii, overlay scrims for text-on-image) and a neutral, non-competing UI palette so photography pops.
Trust + freshness cues. Color and iconography should signal freshness, cleanliness, and reliability (cold-chain, delivery time, sourcing). This shapes the palette direction.
Conversion surfaces. Pricing, quantity/weight selectors, cart, delivery slots, payment — these need strong semantic colors (success/error/warning) and unambiguous interactive states.
Status-driven states. Order tracking, stock availability, delivery windows → you'll need state and status tokens (active/pending/delivered/out-of-stock), not just a base palette.
Device & responsiveness implications (the technical core):

Your Realme X is 1080 × 2340 physical px. React Native works in density-independent units (dp/pt), not raw pixels. At that screen's ~3× density, your logical canvas is roughly 360 × 780 dp. My recommendation:

Design on a 360 dp base width (matches your test device and is the most common Android baseline; iPhones sit at 375–430 dp, so 360 is a safe floor).
Never hard-code pixel sizes. Build everything from tokens + flexbox so layouts scale rather than break across the 320 dp (small phones) → 430 dp (large phones) → 600 dp+ (tablets/foldables) range.
Treat the foundation as unit- and density-agnostic: define tokens as numbers (dp), and let the RN runtime handle physical pixels and @2x/@3x assets.
This is exactly the right instinct on your part — optimize for the system, not the one device.

2. Recommended foundation scope
Below is everything I recommend defining. I've marked [Core] (must-have for v1) vs [Recommended] (professional completeness — easy to add now, painful to retrofit). The ★ items are ones beginners commonly miss but you specifically benefit from.

A. Token architecture & naming [Core] ★
The single most important decision — get this right and everything else slots in. I recommend a 3-tier token model:

Primitive tokens (raw values, no meaning): blue-500, gray-100, space-4, radius-md. Never used directly in screens.
Semantic tokens (intent, reference primitives): color-background, color-text-primary, color-action-primary, color-success. This is what designers/devs actually use.
Component tokens (optional, later): button-primary-bg, card-radius.
Why 3 tiers: semantic tokens are what make dark mode, rebrands, and theming a one-line change instead of a find-and-replace nightmare.

Naming convention: category-role-variant-state (e.g. color-text-primary, color-action-primary-pressed). Lowercase, kebab-case, consistent ordering. In Figma these become Variables organized into Collections (Primitives, Semantic) with Modes for Light/Dark.

B. Color palette [Core]
Recommended structure (not final values — for your approval):

Brand/primary: an ocean/teal blue family (trust, sea, freshness) as the anchor.
Accent/secondary: a warm coral or "fresh catch" orange for CTAs, prices, highlights — high contrast against blue, appetite-stimulating.
Neutrals: a 10–12 step gray ramp (backgrounds, surfaces, text, borders). The workhorse of the whole UI.
Semantic: success (green/fresh), warning (amber), error (red), info (blue). Each needs a base + subtle background + text-on variant.
Status (domain-specific): in-stock / low-stock / out-of-stock, order states.
Each color as a full ramp (e.g. 50–900) so you have hover/pressed/disabled/surface shades.
Dark mode ★: decide now whether v1 supports it. Even if you ship light-only, defining semantic tokens makes it additive later.
C. Typography [Core]
Font family: one primary typeface (recommend a clean, highly legible sans — e.g. Inter, or a friendly rounded sans for a more approachable food feel). Loaded via expo-font. Optionally one display/accent face.
Type scale: a modular scale (e.g. ~1.2 ratio): Display, Headline (H1–H3), Title, Body (L/M/S), Label, Caption/Overline.
For each role define: size, line-height, weight, letter-spacing.
Weights: limit to 3–4 (e.g. Regular 400, Medium 500, SemiBold 600, Bold 700).
★ Respect OS dynamic type — define how text scales with accessibility font settings (and where you cap it).
D. Spacing system [Core]
4 dp base unit, 8 dp rhythm. Scale: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
Use named tokens (space-sm/md/lg) mapped to the scale.
Distinguish inset (padding inside components), stack/inline (gaps between elements), and layout (section spacing).
E. Grid & layout principles [Core]
Screen margins (gutters): recommend 16 dp default (16–20 dp range).
Single-column mobile layout with defined content max-width for tablets.
★ Safe areas: mandatory in RN — status bar, notch, home indicator. Standardize use of react-native-safe-area-context.
Define list/card spacing, section dividers, and a content density baseline.
F. Border radii [Core]
Scale: none (0), sm (4), md (8), lg (12), xl (16), 2xl (24), pill (999), full (circular).
Recommend a consistent "brand roundness" — food/delivery apps lean friendly (md–lg).
G. Elevation & shadows [Core] ★ (RN gotcha)
iOS uses shadowColor/Offset/Opacity/Radius; Android uses elevation. They don't match automatically. Define named elevation levels (0–5) that specify both platforms so cards/sheets look consistent cross-platform.
Map levels to use: card, sticky header, FAB, modal/bottom-sheet, menu.
H. Lines & dividers [Core]
Divider color (a neutral), thickness, and standard use of StyleSheet.hairlineWidth for crisp 1px lines at any density.
Border tokens (default, subtle, strong, focus).
I. Iconography guidelines [Core] (see §3)
Canonical grid (recommend 24×24), stroke width, style (outline vs filled vs duotone), sizing tokens, naming, categorization.
J. Sizing & scaling rules [Core] ★
★ Minimum touch target 44×44 (iOS) / 48×48 dp (Android) — accessibility-critical for buttons, list rows, icon taps.
Standard component heights (button, input, tab bar, app bar), icon size tokens (16/20/24/32/40), avatar/thumbnail sizes.
A clear responsive strategy: flex-first, token-driven; decide whether to use a scaling helper (e.g. react-native-size-matters) or pure flex (I lean pure flex + tokens to avoid over-scaling text).
K. Accessibility [Core] ★
Contrast: WCAG AA — 4.5:1 body text, 3:1 large text & UI/icons. Every semantic color pair must pass.
Touch targets (above), screen-reader labels, focus/visible states, never rely on color alone (pair with icon/text for status), and motion-reduction support.
L. Things you didn't list but I recommend [Recommended] ★
Interaction state tokens: default / pressed / focused / disabled / loading — with opacity/overlay values. (Mobile = pressed, not hover.)
Motion tokens: durations (fast/base/slow ~150/250/400ms) and easing curves, for consistent transitions.
Opacity scale (disabled, scrim, overlays).
Z-index / layering scale (base, sticky, dropdown, modal, toast).
Breakpoints for tablet/foldable adaptation.
Imagery guidelines: product photo aspect ratios, corner radius, gradient scrims for text legibility, placeholder/skeleton treatment.
Empty / error / loading state patterns (foundational, even before components).
Haptics guidance (add-to-cart, success) — a nice mobile-native touch.
3. Icon set — review approach
I cannot see the "Icons" page yet — the Figma MCP only returns your "Design System" page. Please re-open the Fresh Catch file in the Figma Desktop app (the MCP reads live from the desktop app) and confirm the Icons page appears; then I'll do the actual review.

Meanwhile, since these were copied from another design system, here's the checklist I'll evaluate them against, and my general advice:

Consistency: Are they all one style (outline or filled), one visual weight, one corner/terminal treatment? Mixed-source icons usually aren't — this is the #1 thing to fix.
Grid & sizing: Do they share a uniform artboard (e.g. 24×24) with consistent live area + padding? Inconsistent padding makes icons look randomly sized even when the frame matches.
Stroke width: Outline icons must share one stroke width (e.g. 1.5 or 2 dp) and use outlined/expanded strokes or consistent vector strokes — critical so they scale cleanly in RN.
Naming: Need a convention (icon-cart, icon-delivery-truck, icon-fish), categorized (navigation, commerce, status, social, seafood-specific).
Licensing ★: icons "copied from another design system" may carry a license (MIT, Apache, CC, or proprietary). We must confirm they're legally usable in a commercial product before adopting — I'll flag any that look like a known paid set.
Format for RN: decide delivery format — recommend SVG via react-native-svg (crisp, tintable, single source) over PNG @2x/@3x exports.
My likely recommendation will be one of: (a) normalize the borrowed set to our grid/stroke/naming if the style fits and licensing is clear, or (b) adopt a single coherent open-source library (e.g. Lucide/Phosphor/Feather — consistent, free, RN-ready) and supplement with a few custom seafood-specific icons. I'll advise specifically once I can see them.

4. Proposed next steps (after your approval)
You confirm scope — tell me which [Recommended] items to include, and key decisions: dark mode in v1? primary brand color direction? icon strategy (normalize borrowed vs. adopt library)? I've queued these as questions below.
Make the Icons page visible so I can review the real set.
Establish token architecture in Figma as Variables (Primitives + Semantic collections, Light/[Dark] modes).
Build the foundation page section-by-section: color → type → spacing → radii → elevation → borders → sizing → icons, each documented with its tokens and usage notes.
Validate accessibility (contrast checks on every semantic pair).
Define the code mapping — how these tokens land in your Expo app (theme constants / provider) so design and code stay in sync. (I won't read the codebase per your instruction; I'll propose the mapping conceptually.)
Then, separately and later: component library.
