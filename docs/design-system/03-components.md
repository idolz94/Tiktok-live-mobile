# Component Library

Shared components live in `src/components/`. Feature-specific components live in `src/features/<feature>/components/`.

---

## Button

`src/components/button/index.tsx`

| Prop | Type | Notes |
|---|---|---|
| `onPress` | `() => void` | |
| `label` | `string` | |
| `gradientType` | `GradientType` | renders `LinearGradient` with `StyleSheet.absoluteFill` |
| `loading` | `boolean` | shows spinner; position: `side` or `center` |
| `disabled` | `boolean` | `opacity: 0.5` |
| `variant` | `'primary' \| 'outline' \| ...` | |

Style constants:
- `borderRadius: 99` (pill)
- `height: 48` (default)
- Label: `textPresets.fs16_500`
- Disabled: `opacity: 0.5`

---

## Input

`src/components/input/index.tsx`

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | rendered above the input |
| `error` | `string` | shown below; changes border to `colors.error` |
| `rightElement` | `ReactNode` | right slot |
| `disabled` | `boolean` | `backgroundColor: colors.neutral50, opacity: 0.6` |

Style constants:
- `height: 48`
- `borderRadius: 8`
- `borderWidth: HairlineWidth * 3`
- Focus state: `borderColor: colors.primary`
- Error state: `borderColor: colors.error`
- Normal state: `borderColor: colors.border10`

---

## Header

`src/components/header/index.tsx`

| Prop | Type | Notes |
|---|---|---|
| `showBack` | `boolean` | back button |
| `title` | `string` | centered |
| `rightIcon` | `ReactNode` | right slot |

Style constants:
- Back/action button: `width: 40, height: 40, borderRadius: 99, backgroundColor: colors.neutral50`
- Title: `textPresets.fs16_600`
- Icon library: `Ionicons`
- Safe-area aware

---

## EmptyState

`src/components/empty-state/index.tsx`

| Prop | Type |
|---|---|
| `image` | `ImageSourcePropType` |
| `title` | `string` |
| `subtitle` | `string` |
| `action` | `{ label: string; onPress: () => void }` |

Style constants:
- Image: `120×120`
- Title: `textPresets.fs16_500, color: colors.neutral500`
- Subtitle: `textPresets.fs14_400, color: colors.neutral300`
- Action button: `borderRadius: 8, borderWidth: 1, borderColor: colors.primary`

---

## LinearGradient

`src/components/linear-gradient/index.tsx`

```tsx
<LinearGradient type="gra_primary" style={styles.gradient} />
<LinearGradient type="gra_background" start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
```

| Prop | Type | Default |
|---|---|---|
| `type` | `GradientType` | required |
| `start` | `{ x, y }` | `{ x: 0, y: 0 }` |
| `end` | `{ x, y }` | `{ x: 1, y: 0.3 }` |
| `style` | `StyleProp<ViewStyle>` | |

Also exports `AnimatedLinearGradient` for animated border effects.

`GradientType` values: `gra_primary`, `gra_background`, `gra_border_animated`, `gra_info`, `gra_success`, `gra_warning`, `gra_social`, `gra_neutralDark`

---

## Avatar

`src/components/avatar/index.tsx`

```tsx
<Avatar uri={user.avatarUrl} size={42} />
```

| Prop | Type | Default |
|---|---|---|
| `uri` | `string?` | falls back to `images.logo_app` |
| `size` | `number` | `42` |

Always circular (`borderRadius: size / 2`). Uses `expo-image` with `cachePolicy="memory-disk"`.

Note: `username` prop is declared in the type but unused — do not pass it.

---

## MoneyDisplay

`src/components/money-display/index.tsx`

```tsx
<MoneyDisplay value={150000} size="lg" color={colors.primary} />
```

| Prop | Type | Default |
|---|---|---|
| `value` | `number` | required |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `string` | `colors.neutral900` |
| `style` | `TextStyle` | |

Size → preset mapping:
- `sm` → `fs12_400`
- `md` → `fs14_500`
- `lg` → `fs16_600`

Calls `formatMoney(value)` from `@features/orders/utils/order`. Note: this is a cross-feature dependency from a shared component into a feature util — if `formatMoney` moves, update this import.

---

## BottomSheet

`src/components/bottom-sheet/`

```tsx
// Provider wraps the app tree in src/app/_layout.tsx
<BottomSheetProvider>...</BottomSheetProvider>

// Usage inside any component
const { show, hide } = useBottomSheet();

const id = show({ content: <MySheetContent onClose={() => hide(id)} /> });
hide(id); // close specific sheet
hide();   // close all
```

Built on `@expo/ui/community/bottom-sheet`. The `show()` call returns an ID for targeted close.

---

## Popover

`src/components/popover/`

Full custom portal-based popover with collision detection. 10 files.

```tsx
// Provider in src/app/_layout.tsx
<PopoverProvider>...</PopoverProvider>

// Usage
const { showPopover, hidePopover } = usePopover();
```

---

## Screen

`src/components/screen/index.tsx`

Base screen wrapper used by all screens. Handles safe-area and keyboard behavior.

```tsx
<Screen>
  {/* screen content */}
</Screen>
```

---

## AnimatedErrorText

`src/components/animated-error-text/index.tsx`

Debounced animated error message. 500ms debounce on show, instant clear.

Only component with a test: `animated-error-text.test.tsx`.

---

## Feature-level primitives

### OrderDetailPrimitives

`src/features/orders/components/order-detail/order-detail-primitives.tsx`

| Component | Notes |
|---|---|
| `Divider` | horizontal separator |
| `Section` | card container: `borderRadius:12, borderWidth:0.5, borderColor:colors.border10, ...shadows.sd2` |
| `SectionHeader` | section title row |
| `MoneyRow` | label + money value row |
| `StatusTag` | colored status badge |
| `CurrencyInputRow` | currency input: `borderRadius:10, height:40` |

### SectionBlock

`src/features/orders/components/create-shipment/section-block.tsx`

Section layout with title and optional action link.

- Container: `paddingHorizontal:16, paddingVertical:20, gap:16`
- Title: `textPresets.fs18_700`
- Action text: `colors.primary + textPresets.fs14_500`

### OptionChip

`src/features/orders/components/create-shipment/option-chip.tsx`

Radio-style chip with dot indicator.

```tsx
<OptionChip label="Giao hàng tận nơi" selected={selected} onPress={onPress} />
```

Style constants:
- `minHeight: 48, borderRadius: 14, paddingHorizontal: 14`
- Selected: `borderColor: colors.primary, backgroundColor: colors.primaryLight`
- Unselected: `borderColor: colors.border10, backgroundColor: colors.surface`
- Dot: `18×18, borderRadius:9, borderWidth:2`
- Inner dot: `8×8, borderRadius:4, backgroundColor: colors.primary`

### MoneyField

`src/features/orders/components/create-shipment/money-field.tsx`

Currency input field with label.

Style constants:
- `height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14`
- Input: `textPresets.fs16_500`
- Label: `textPresets.fs14_400, color: colors.neutral400`

### OrderStatCard

`src/features/orders/components/order-stat-card.tsx`

Stat card with Lottie icon, value, and label. Used in order filter tabs.

```tsx
<OrderStatCard
  lottie="home"
  value={12}
  label="Đơn mới"
  filterKey={OrderFilter.New}
  isActive={activeFilter === OrderFilter.New}
  bgColor={colors.neutral50}
  onPressCard={setFilter}
/>
```

Style constants:
- `flex:1, borderRadius:12, padding:16, ...shadows.sd1`
- Value: `textPresets.fs20_600, color: colors.neutral900`
- Label: `textPresets.fs12_400, color: colors.neutral400`
- Known issue: `borderColor: isActive ? "red" : "transparent"` — hardcoded color, should be `colors.error`

### ShippingProviderSheet

`src/features/orders/components/shipping-provider-sheet.tsx`

Bottom sheet for selecting shipping provider. Shows connected providers, unconnected (with connect action), and disabled coming-soon items.

```tsx
<ShippingProviderSheet
  selected={selectedProvider}
  spxConnected={spxConnected}
  onClose={close}
  onSelect={(provider) => setSelectedProvider(provider)}
  onConnectSpx={() => router.push("/shipping-settings")}
/>
```

Style constants:
- Sheet: `borderTopLeftRadius:20, borderTopRightRadius:20, paddingHorizontal:20`
- Row: `borderRadius:12, borderWidth:1, borderColor:colors.border10`
- Disabled row: `opacity:0.45`
- Avatar: `36×36, borderRadius:8`
- Selected check: `22×22, borderRadius:11, backgroundColor:colors.primary`
- Connect badge: `borderRadius:99, backgroundColor:colors.primary`
- Cancel button: `height:48, borderRadius:40`
