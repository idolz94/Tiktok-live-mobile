import { Stack } from "expo-router";

export default function ShippingDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
