# Design Tokens

Source of truth: `src/themes/`

---

## Colors

File: `src/themes/colors.ts`

### Neutrals

| Token | Value |
|---|---|
| `neutral900` | `#000000` |
| `neutral500` | `#2B2B2B` |
| `neutral400` | `#484848` |
| `neutral300` | `#787878` |
| `neutral100` | `#ffffff` |
| `neutral50` | `rgba(242,242,242,1)` — page/input background |

### Brand

| Token | Value |
|---|---|
| `primary` | `#FF6B8A` |
| `primaryLight` | `rgba(255,232,232,1)` — selected chip background |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `success` | `rgba(44,168,123,1)` | |
| `error` | `rgba(255,66,66,1)` | |
| `warning` | `rgba(255,168,0,1)` | |
| `info` | `rgba(70,138,223,1)` | |

### Surface / Background

| Token | Value |
|---|---|
| `surface` | `#ffffff` (alias of `neutral100`) |
| `background` | page background |

### Borders

| Token | Value |
|---|---|
| `border10` | subtle border (light) |
| `border20` | stronger border |

### Hardcoded values — known inconsistencies

These values appear in code but have no theme token. They should be migrated:

| Value | Location | Should be |
|---|---|---|
| `"red"` | `order-stat-card.tsx:33` | `colors.error` |
| `"#F3F4F6"` | `shipping-settings.styles.ts:199` | `colors.neutral50` |
| `"#6B7280"` | `shipping-settings.styles.ts:205` | `colors.neutral400` |
| `"#111827"` | `shipping-settings.styles.ts:266` | `colors.neutral900` |
| `"#ef4444"` | `shipping-settings.styles.ts:271` | `colors.error` |
| `"#d1d5db"` | `shipping-settings.styles.ts:289` | `colors.border20` |
| `"#ebb140"` | `shipping-settings.styles.ts:323` | no token — amber/warning variant |
| `"rgba(0,0,0,0.35)"` | modals | no token |

---

## Typography

File: `src/themes/typography.ts`

Pattern: `fs{size}_{weight}` — each preset is `{ fontSize, fontWeight }`.

### Most-used presets

| Token | fontSize | fontWeight | Usage |
|---|---|---|---|
| `fs20_600` | 20 | 600 | stat card value |
| `fs18_700` | 18 | 700 | section block title |
| `fs18_600` | 18 | 600 | modal title |
| `fs18_500` | 18 | 500 | screen header title (shipping-settings) |
| `fs16_600` | 16 | 600 | header title, bottom sheet title |
| `fs16_500` | 16 | 500 | button label, section title, input text |
| `fs16_400` | 16 | 400 | body text |
| `fs15_500` | 15 | 500 | warehouse card title |
| `fs14_500` | 14 | 500 | row label, partner name, action link |
| `fs14_400` | 14 | 400 | body / input label / description |
| `fs13_500` | 13 | 500 | form input label |
| `fs12_500` | 12 | 500 | section label, connect badge |
| `fs12_400` | 12 | 400 | stat card label, description, meta |

### Usage rule

- Use `textPresets.fs*` via `useThemes()` or spread into `createStyles` — never hardcode `fontSize` + `fontWeight` separately when a preset exists.
- Text color is always applied separately (`color: colors.neutral900`) — presets do not include color.

---

## Shadows

File: `src/themes/shadow.ts`

Cross-platform (iOS + Android + web). Five levels:

| Token | Typical use |
|---|---|
| `sd1` | stat cards, flat cards |
| `sd2` | section cards, order detail |
| `sd3` | elevated surfaces |
| `sd4` | tab bar |
| `sd5` | modals, toasts |

Spread into styles: `...shadows.sd2`

---

## Gradients

File: `src/themes/colors.ts` — `linearGradients` object

| Token | Colors | Direction |
|---|---|---|
| `gra_primary` | `["#FF6B8A","#FFA66D","#FFC86A"]` | left → right |
| `gra_background` | `["rgba(255,107,138,0.3)","rgba(255,166,109,0.2)","rgba(255,255,255,0)"]` | top → bottom |
| `gra_border_animated` | animated border gradient | |
| `gra_info` | info blue gradient | |
| `gra_success` | success green gradient | |
| `gra_warning` | warning amber gradient | |
| `gra_social` | social channel gradient | |
| `gra_neutralDark` | dark overlay gradient | |

Used via `<LinearGradient type="gra_background" />` — see Component docs.

---

## Spacing

No dedicated spacing token file. Conventions from usage:

| Value | Usage |
|---|---|
| `4` | micro gap |
| `8` | item gap, icon+text |
| `12` | card padding, row gap |
| `14` | chip padding horizontal |
| `16` | screen padding horizontal, section padding |
| `20` | section vertical padding |
| `24` | modal padding bottom |
| `32` | scroll content bottom padding |

---

## Border radius

| Value | Usage |
|---|---|
| `8` | inputs, buttons (non-pill), form errors |
| `10` | currency input box |
| `12` | cards, partner cards, shipping rows |
| `14` | option chips, money field |
| `16` | warehouse cards, modal cards |
| `20` | bottom sheet top corners |
| `24` | geo picker top corners |
| `99` | pill buttons, avatar circles, badges |

---

## HairlineWidth

`src/themes/index.ts`:

```ts
export const HairlineWidth = Math.min(StyleSheet.hairlineWidth, 0.333);
```

Used for thin borders: `borderWidth: HairlineWidth * 3` ≈ 1px on all densities.

Per `CLAUDE.md`: do not use `StyleSheet.hairlineWidth` directly; replace with the `HairlineWidth` constant.
