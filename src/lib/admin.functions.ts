import { createServerFn } from "@tanstack/react-start";

// ⚠️ DEV ONLY: Auth & role check bypassed for testing.
// Re-enable requireSupabaseAuth middleware before going to production!

/** Resolve the signed-in user's Counter Mode access and display role. */
export const getMyRole = createServerFn({ method: "GET" }).handler(async () => {
  // DEV BYPASS: always return full admin access
  return {
    userId: "dev-user",
    email: "dev@localhost",
    roles: ["admin"],
    isAdmin: true,
    isStaff: true,
    hasAccess: true,
  };
});
