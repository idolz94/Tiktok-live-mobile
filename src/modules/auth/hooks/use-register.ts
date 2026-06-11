/**
 * @deprecated Use Clerk useSignUp hook directly instead.
 */
export const useRegister = (_onRegisterSuccess?: () => void) => {
  return {
    handleRegister: async (_values: any) => {
      throw new Error("useRegister is deprecated — use Clerk useSignUp instead");
    },
    isLoading: false,
  };
};
