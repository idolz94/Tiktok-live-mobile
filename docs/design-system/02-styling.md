# Styling System

---

## createStyles

File: `src/utils/createStyles.ts`

```ts
export function createStyles<T>(
  styles: T | ((theme: AppTheme) => T)
): T
```

Wraps `StyleSheet.create()`. Accepts a callback receiving the full `AppTheme` singleton.

**Key behavior:** called at **module load time** with a static theme. The theme does not change at runtime — all dynamic color/spacing values that depend on component state or context must go through `useThemes()` inline.

```ts
// Static structural styles — use createStyles
const styles = createStyles(({ colors, textPresets, shadows }) => ({
  card: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border10,
    ...shadows.sd2,
  },
  label: { ...textPresets.fs14_400 },
}));

// Dynamic colors that change per-render — use useThemes() inline
const { colors } = useThemes();
<View style={[styles.card, { backgroundColor: isSelected ? colors.primaryLight : colors.surface }]} />
```

### Rules (from CLAUDE.md)

- Place `createStyles(...)` at the **bottom of the `.tsx` file**, after the component.
- Do **not** extract to a separate `*-styles.ts` file unless the styles are shared by multiple components.
- Do **not** import `StyleSheet` from `react-native` for new styles — use `createStyles` instead. Exception: `StyleSheet.absoluteFill`.
- Replace `StyleSheet.hairlineWidth` with the `HairlineWidth` constant.

---

## useThemes

File: `src/hooks/use-theme.ts`

```ts
const { theme, colors, shadows, textPresets } = useThemes();
```

Returns the static `AppTheme` singleton. Use for:
- Inline dynamic style props: `style={{ color: colors.primary }}`
- Conditional styling: `style={[styles.base, { borderColor: selected ? colors.primary : colors.border10 }]}`
- Theme-derived values in JSX: `<Text style={[textPresets.fs16_600, { color: colors.neutral900 }]}>`

---

## Conditional style arrays

The standard pattern for conditional styles:

```tsx
<Pressable
  style={[
    styles.chip,
    {
      borderColor: selected ? colors.primary : colors.border10,
      backgroundColor: selected ? colors.primaryLight : colors.surface,
    },
  ]}
/>
```

Or with static variant styles:

```tsx
<View style={[styles.row, disabled && styles.rowDisabled]} />
```

---

## AppTheme type

```ts
type AppTheme = {
  theme: Theme;           // raw theme object
  colors: Colors;         // full color token map
  shadows: Shadows;       // sd1–sd5
  textPresets: TextPresets; // fs{size}_{weight} map
}
```
