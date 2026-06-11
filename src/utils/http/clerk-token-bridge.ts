let clerkGetTokenFn: ((options?: { template?: string; skipCache?: boolean }) => Promise<string | null>) | null = null;

export const setClerkGetToken = (fn: typeof clerkGetTokenFn | null) => {
  clerkGetTokenFn = fn;
};

export const getClerkToken = async () => {
  if (clerkGetTokenFn) {
    try {
      return await clerkGetTokenFn();
    } catch (error) {
      console.error("[ClerkTokenBridge] Lỗi lấy token từ Clerk:", error);
      return null;
    }
  }
  return null;
};
