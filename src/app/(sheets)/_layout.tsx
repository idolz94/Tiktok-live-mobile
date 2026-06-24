import { createStyles } from "@utils/createStyles";
import { Stack } from "expo-router";

export default function FormSheets() {
  return (
    <Stack>
      <Stack.Screen
        name="tiktok-channels"
        options={{
          presentation: "formSheet",
          title: "Quản Lý Kênh Tiktok",
          headerShown: false,
          sheetAllowedDetents: "fitToContents",
          contentStyle: styles.whiteContentFormSheet,
        }}
      />
    </Stack>
  );
}

const styles = createStyles(({ colors }) => ({
  whiteContentFormSheet: {
    backgroundColor: colors.neutral100,
  },
}));
