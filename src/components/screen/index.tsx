import { createStyles } from "@/utils/createStyles";
import { View } from "react-native";
import { ScreenProps } from "./type";

export const Screen = ({
  backgroundColorTheme,
  children,
  statusBarStyle,
}: ScreenProps) => {
  // useHandleStatusBar({ statusBarStyle });

  return (
    <View style={[styles.container, { backgroundColor: backgroundColorTheme }]}>
      {children}
    </View>
  );
};

/**
 * sau triển khai theme dark mode sẽ mở comment phần này
 */
// const useHandleStatusBar = ({
//   statusBarStyle,
// }: Pick<ScreenProps, "statusBarStyle">) => {
//   const handleStatusBar = useCallback(
//     ({ s, d }: { s?: "light-content" | "dark-content"; d: boolean }) => {
//       StatusBar.setBarStyle(s ?? (d ? "light-content" : "dark-content"), true);
//     },
//     [],
//   );

//   useFocusEffect(() => {
//     handleStatusBar({ d: dark, s: statusBarStyle });
//   });

//   useEffect(() => {
//     handleStatusBar({ d: dark, s: statusBarStyle });
//   }, [dark, statusBarStyle]);
// };

const styles = createStyles(() => ({
  container: {
    flex: 1,
    zIndex: 0,
  },
}));
