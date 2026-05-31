import { theme } from "@themes";
import { useMemo } from "react";

/**
 * Hook để lấy dữ liệu theme (colors, typography, shadows, v.v.) bên trong component.
 */
export const useThemes = () => {
  // Trả về theme tĩnh hiện tại.
  // Nếu sau này app hỗ trợ Dark Mode, bạn có thể implement logic để return theme tương ứng.
  const currentTheme = useMemo(() => theme, []);

  return {
    theme: currentTheme,
    colors: currentTheme.colors,
    shadows: currentTheme.shadows,
    textPresets: currentTheme.textPresets,
  };
};
