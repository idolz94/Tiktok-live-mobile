# Navigation & Screen Architecture

---

## Stack

Expo Router (file-based). Root layout at `src/app/_layout.tsx`.

Provider stack (outer → inner):

```
SafeAreaProvider
  → GestureHandlerRootView
    → KeyboardProvider
      → ToastProvider
        → BottomSheetProvider
          → PopoverProvider
            → TikTokLiveSocketProvider
              → Stack (Expo Router)
```

---

## Route map

```
src/app/
  _layout.tsx              root providers + Stack
  index.tsx                redirect gate (auth check)

  (auth)/
    _layout.tsx
    index.tsx              login screen

  (tabs)/
    _layout.tsx            CustomTabBar + 6 tabs
    index.tsx              Home (orders)
    customers.tsx
    history.tsx
    shipping.tsx
    reports.tsx
    settings.tsx

  (sheets)/
    _layout.tsx            sheet/modal group

  order-detail/
    index.tsx              order detail
    create-shipment/
      index.tsx            create shipment form
      address-form.tsx
      address-picker.tsx
      success.tsx

  shipping-detail/
    [id].tsx               shipping detail dynamic route

  license-expired/
  manage-tiktok-channel/
  onboarding/
  splash/

  printer-settings.tsx
  product-info-setup.tsx
  shipping-address-form.tsx
  shipping-settings.tsx
  license-plans.tsx
  live-session-detail.tsx
```

---

## Tab bar

`src/app/(tabs)/_layout.tsx` — `CustomTabBar` with Lottie icons.

| Tab key | Route | Lottie |
|---|---|---|
| `index` | Home (orders) | `home` |
| `customers` | Customers | `customer` |
| `history` | Live history | `time` |
| `shipping` | Shipping | `truck` |
| `reports` | Reports | `chart` |
| `settings` | Settings | `settings` |

Tab bar style: `...shadows.sd4`

---

## Navigation pattern

Route files only:
1. Declare path
2. Read URL params (`useLocalSearchParams`)
3. Guard (auth check if needed)
4. Render screen component imported from `src/features/<feature>/screens/`

Business logic never lives in route files.

---

## Order detail flow

```
(tabs)/index — order list
  → order-detail/index — order detail + ship bar
    → order-detail/create-shipment/index — SPX / manual form
      → order-detail/create-shipment/address-picker
      → order-detail/create-shipment/address-form
      → order-detail/create-shipment/success
```

Params passed via `router.push({ pathname, params })`. Order data is JSON-serialized in params.

---

## Settings flow

```
(tabs)/settings
  → shipping-settings (warehouse + shipping partners)
    → shipping-address-form (add/edit address)
  → printer-settings
  → product-info-setup
  → license-plans
  → manage-tiktok-channel/
```

---

## Screen layout pattern

Most screens follow this structure:

```tsx
<Screen>                          // SafeArea + keyboard wrapper
  <View style={styles.container}>
    <LinearGradient               // optional background gradient
      type="gra_background"
      style={StyleSheet.absoluteFill}
    />
    <Header title="..." />        // or custom header
    <ScrollView
      contentContainerStyle={styles.scrollContent}  // paddingHorizontal:16, gap:16
    >
      {/* sections */}
    </ScrollView>
    {/* sticky bottom bar if needed */}
  </View>
</Screen>
```

Scroll content padding: `paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16`
