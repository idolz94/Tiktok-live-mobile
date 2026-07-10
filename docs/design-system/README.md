# Design System — Lumi Mobile

Documentation for the Lumi Mobile design system and codebase conventions.
Generated from source audit of `src/` — 2026-07-09.

---

## Contents

| File | What's inside |
|---|---|
| [01-tokens.md](01-tokens.md) | Colors, typography, shadows, gradients, spacing, border radius, HairlineWidth |
| [02-styling.md](02-styling.md) | `createStyles`, `useThemes`, conditional style arrays |
| [03-components.md](03-components.md) | Shared component API + feature-level primitives |
| [04-navigation.md](04-navigation.md) | Route map, provider stack, tab bar, screen layout pattern |
| [05-patterns.md](05-patterns.md) | Recurring UI patterns and hook patterns |
| [06-features.md](06-features.md) | Feature inventory, service layer, assets, test coverage |

---

## Quick reference

### Add a new screen

1. Create route file in `src/app/` (params + guard only)
2. Create screen component in `src/features/<feature>/screens/`
3. Extract logic to `src/features/<feature>/hooks/use-<screen>.ts` if > ~30 lines
4. Style with `createStyles(({ colors, textPresets, shadows }) => ...)` at bottom of file
5. Use `<Screen>` wrapper + standard scroll content padding (`paddingHorizontal:16, gap:16`)

### Add a new shared component

1. Create in `src/components/<name>/index.tsx`
2. Use `createStyles` for static styles, `useThemes()` for dynamic colors
3. No business logic — pure UI

### Use a color token

```tsx
const { colors } = useThemes();
<Text style={{ color: colors.primary }} />

// in createStyles:
const styles = createStyles(({ colors }) => ({
  label: { color: colors.neutral400 },
}));
```

### Use a typography preset

```tsx
const { textPresets } = useThemes();
<Text style={[textPresets.fs16_600, { color: colors.neutral900 }]} />

// in createStyles:
const styles = createStyles(({ textPresets }) => ({
  title: { ...textPresets.fs18_700 },
}));
```

### Use a shadow

```tsx
const styles = createStyles(({ shadows }) => ({
  card: { borderRadius: 12, ...shadows.sd2 },
}));
```

### Open a bottom sheet

```tsx
const { show, hide } = useBottomSheet();
const id = show({ content: <MySheet onClose={() => hide(id)} /> });
```

---

## Known issues to fix

| Issue | File | Fix |
|---|---|---|
| `"red"` hardcoded | `order-stat-card.tsx:33` | → `colors.error` |
| Many hardcoded hex values | `shipping-settings.styles.ts` | → theme tokens |
| `formatMoney` imported from feature in shared component | `money-display/index.tsx` | move util to `src/utils/` |
| `username` prop declared but unused | `avatar/index.tsx` | remove from type |
| Spinner color hardcoded `"#FF6B8A"` | various screens | → `colors.primary` |
