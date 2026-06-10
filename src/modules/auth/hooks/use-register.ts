import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { RegisterForm } from "src/schemas/auth";

export const useRegister = (onRegisterSuccess?: () => void) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = useCallback(
    async (values: RegisterForm) => {
      setIsLoading(true);
      const result = await register(values);
      setIsLoading(false);

      if (result.ok) {
        Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
          { text: "OK", onPress: onRegisterSuccess },
        ]);
      } else {
        Alert.alert("Thất bại", result.message || "Đăng ký không thành công");
      }
    },
    [register, onRegisterSuccess],
  );

  return {
    handleRegister,
    isLoading,
  };
};
