# UI Patterns

Common patterns used across Lumi Mobile screens.

---

## Screen with gradient background

Used by: order detail, create shipment, main screens.

```tsx
<Screen>
  <View style={styles.container}>
    <LinearGradient
      type="gra_background"
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
    {/* content at zIndex: 1 */}
  </View>
</Screen>

const styles = createStyles(() => ({
  container: { flex: 1 },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  scroll: { flex: 1, zIndex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 },
}));
```

---

## Card / Section

Standard card used in order detail, settings, etc.

```tsx
<View style={styles.card}>
  {/* content */}
</View>

// in createStyles:
card: {
  borderRadius: 12,
  borderWidth: 0.5,
  borderColor: colors.border10,
  backgroundColor: colors.neutral100,
  ...shadows.sd2,
}
```

---

## List item row

Standard bordered row used in shipping provider sheet, partner list, etc.

```tsx
card: {
  borderRadius: 12,             // or 16 for larger cards
  borderWidth: 1,               // or HairlineWidth * 3 for subtler
  borderColor: colors.border10,
  paddingVertical: 12,
  paddingHorizontal: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}
```

Disabled state: add `opacity: 0.45`

---

## Bottom sheet content

Sheet content components are bare `View` containers — the sheet frame is provided by the `BottomSheetProvider`.

```tsx
<View style={styles.sheet}>
  <Text style={[styles.title, { color: colors.neutral900 }]}>Title</Text>
  {/* rows */}
  <Pressable style={[styles.cancelBtn, { borderColor: colors.border10 }]} onPress={onClose}>
    <Text style={{ color: colors.neutral500, ...textPresets.fs14_500 }}>Huỷ</Text>
  </Pressable>
</View>

sheet: {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 20,
  paddingTop: 12,
  rowGap: 8,
}
```

---

## Section block (create shipment)

```tsx
<SectionBlock title="Thông tin giao hàng" action={{ label: "Thay đổi", onPress: ... }}>
  {/* fields */}
</SectionBlock>
```

Container: `paddingHorizontal:16, paddingVertical:20, gap:16`

---

## Option chip (radio select)

```tsx
<OptionChip label="Giao hàng tận nơi" selected={isSelected} onPress={() => setSelected(key)} />
```

Use for mutually exclusive option selection within a section.

---

## Loading state

Full-screen centered spinner:

```tsx
{loading && (
  <View style={styles.loadingBox}>
    <ActivityIndicator size="large" color="#FF6B8A" />
  </View>
)}

loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" }
```

Note: spinner color uses hardcoded `#FF6B8A` (= `colors.primary`) in several places. Should use `colors.primary`.

---

## Empty state

```tsx
<EmptyState
  image={images.empty_orders}
  title="Chưa có đơn nào"
  subtitle="Đơn hàng từ live sẽ xuất hiện tại đây"
  action={{ label: "Tạo đơn thủ công", onPress: handleCreate }}
/>
```

---

## Tag / badge

Pill badge pattern:

```tsx
<View style={styles.badge}>
  <Text style={styles.badgeText}>{label}</Text>
</View>

badge: {
  height: 24,
  borderRadius: 16,
  backgroundColor: colors.primaryLight,  // or semantic color
  paddingHorizontal: 8,
  alignItems: "center",
  justifyContent: "center",
}
badgeText: { ...textPresets.fs12_500, color: colors.primary }
```

Variants in code: `comingSoonTag` (#F3F4F6 bg), `connectTag` (#ff3911 bg), `defaultTag` (neutral50 bg).

---

## Add / dashed button

Used for "add address", "add warehouse", etc.

```tsx
addButton: {
  height: 48,
  borderRadius: 8,
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: colors.border20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
}
```

---

## Breakline / section divider

Visual separator between page sections (not between list items):

```tsx
breakLine: { height: 8, backgroundColor: colors.neutral50 }
```

---

## Hook pattern

Screen logic > ~30 lines is extracted to `use-<feature>.ts` colocated in the feature folder.

```ts
// use-order-detail.ts — returns everything the screen needs:
export function useOrderDetail(orderId: string) {
  return {
    order, loading, error, fetchOrder,
    products, displayProducts, showAllProducts, toggleShowAllProducts,
    productTotal, shippingFee, totalQuantity,
    handleAddProduct, handleUpdateProduct, handleDeleteProduct,
    addingProduct, updatingProduct, deletingProduct,
    handleToggleDeposit, handleToggleConfirm,
    // ...
  };
}
```

The screen component only calls values and functions from the hook — zero business logic in JSX.

Key patterns inside hooks:
- Race-condition guard: `requestRef = useRef(0)` — increment before each fetch, ignore stale responses
- Double-tap lock: `addingRef = useRef(false)` — synchronous guard before `await`
- UI boolean flags grouped: `const [ui, setUi] = useState<UiState>(UI_INIT)` with `patchUi()`
- Mutation loading flags grouped: `const [mutating, setMutating] = useState<MutatingState>(MUTATING_INIT)`
- Stable empty fallbacks: `const EMPTY_PRODUCTS: OrderProduct[] = []` declared outside component
- Optimistic update + rollback: `previousStatusRef.current = current.depositStatus` before mutation, rollback in catch
- Silent refetch: `silentRefetch()` after mutations — no loading spinner, keeps UI data fresh
