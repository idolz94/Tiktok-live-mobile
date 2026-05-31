import { StyleSheet } from "react-native";
import { theme, AppTheme } from "@themes";

/**
 * Helper to create typed React Native styles with theme integration,
 * similar to React Native Unistyles.
 *
 * It accepts either a callback function that receives the global theme
 * or a plain stylesheet object.
 *
 * @example
 * ```tsx
 * const styles = createStyles((theme) => ({
 *   container: {
 *     flex: 1,
 *     backgroundColor: theme.colors.background,
 *   },
 *   text: {
 *     ...theme.textPresets.body,
 *     color: theme.colors.text,
 *   },
 * }));
 * ```
 */
export function createStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(
  styles:
    | T
    | StyleSheet.NamedStyles<T>
    | ((theme: AppTheme) => T | StyleSheet.NamedStyles<T>),
): T {
  const resolvedStyles = typeof styles === "function" ? styles(theme) : styles;
  return StyleSheet.create(resolvedStyles as T);
}
