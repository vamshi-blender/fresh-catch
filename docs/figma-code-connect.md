# Figma Code Connect — Reference & Decision

> Status: **Not adopted yet (deferred).** Revisit during the component phase.
> Last updated: 2026-06-21 · Context: Fresh Catch design system (Figma) + Expo / React Native app.

## What it is

Code Connect links a **Figma component** to its **real code component**, so that when a
developer selects that component in Figma **Dev Mode**, they see *our actual code* instead of
generic auto-generated CSS.

**Without Code Connect**, Dev Mode shows raw styles:

```
width: 312px; background: var(--color-action-primary); border-radius: 12px; ...
```

**With Code Connect**, Dev Mode shows the real component usage:

```tsx
<Button variant="primary" size="lg" onPress={...}>Sign in</Button>
```

You set it up by writing a small mapping file per component (e.g. `Button.figma.tsx`) that says
"this Figma component = this code component, and Figma's `Style=Primary` prop maps to
`variant="primary"`," then publish it with the Code Connect CLI.

## Will it help this project?

**Not yet — but yes, later.** Code Connect connects a component in Figma to a component in code.
Today we have neither side ready:

- **Figma:** no reusable `Button` / `Input` / `Card` components yet (the login screen is
  hand-built raw nodes bound to tokens).
- **Expo app:** no matching `Button.tsx` etc. yet.

So there is nothing to connect today. It becomes valuable once we reach the **component phase** and
build, for each component:

1. A real component **in Figma** (Button, Input, Card, Badge, …), and
2. The matching component **in Expo/React Native code**.

Then every place a Figma component is dropped, a developer sees the exact RN usage — handoff
becomes near-zero-friction.

## What is already handled (the token-level equivalent)

For **design tokens**, the analogous handoff is already done: every Figma **variable** has
**code syntax** set (e.g. `var(--color-action-primary)`, `var(--spacing-16)`, `var(--radius-lg)`).
So in Dev Mode, any token-bound property already shows the token name, not a raw value. Code Connect
is the *component-level* version of this same idea.

## Prerequisites & caveats (read before adopting)

- **Dev Mode required** → needs a paid seat. Available on the Pro "Quixy & ETS Designs" team; not on
  the Starter team.
- **First-class templates** exist for React (web), SwiftUI, and Jetpack Compose. **React Native is
  not a built-in template**, but Code Connect supports **custom code snippets**, so it works for
  Expo/RN with a bit more manual snippet authoring.
- Requires the **library to be published** and the **Code Connect CLI** to push mappings.
- Mappings live in code (`*.figma.tsx`) and must be kept in sync as components change.

## How to set it up later (rough steps)

1. Build the component in Figma with proper **component properties** (variant, size, state,
   instance-swap for icon, boolean for leading/trailing icon, text prop for label).
2. Build the matching RN component in the Expo app with a clean prop API.
3. Install the Code Connect CLI; run interactive setup to scaffold a `Button.figma.tsx`.
4. In that file, map Figma props → code props and provide the example snippet (custom snippet for
   RN).
5. Publish mappings with the CLI; verify the snippet shows in Dev Mode.
6. Repeat per component (atoms first: Button, Input, Checkbox, Badge → then molecules).

> The Figma MCP/plugin has Code Connect tooling (`get_code_connect_map`, `add_code_connect_map`,
> the `figma-code-connect` skill) that can scaffold these mappings when we get there.

## Decision

Defer Code Connect until the **component phase**. Prerequisite: build the first few components in
Figma **and** their RN counterparts. Until then, the variable code-syntax already covers token
handoff. Revisit this doc when starting the Button component.
