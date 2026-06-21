import { createStyles } from "@utils/createStyles";
import { Stack } from "expo-router";

export default function FormSheets() {
  return (
    // <Stack
    //   screenOptions={{
    //     presentation: "transparentModal",
    //     headerShown: false,
    //     animation: "fade_from_bottom",
    //     sheetAllowedDetents: [0.25, 0.5, 1],
    //     sheetInitialDetentIndex: 1,
    //   }}
    // />
    <Stack>
      <Stack.Screen
        name="test"
        options={{
          presentation: "formSheet",
          title: "Test",
          headerShown: false,
          sheetAllowedDetents: "fitToContents",
          contentStyle: styles.whiteContentFormSheet,
        }}
      />

      <Stack.Screen
        name="test2"
        options={{
          presentation: "transparentModal",
          title: "Test2",
          gestureEnabled: false,
          animation: "fade",
          headerShown: false,
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

// Nếu từng sheet có cấu hình khác nhau
// return (
//     <Stack>
//       <Stack.Screen
//         name="language-picker"
//         options={{
//           presentation: "formSheet",
//           title: "Language",
//         }}
//       />

//       <Stack.Screen
//         name="avatar-picker"
//         options={{
//           presentation: "formSheet",
//           title: "Avatar",
//           gestureEnabled: false,
//         }}
//       />
//     </Stack>
//   );
