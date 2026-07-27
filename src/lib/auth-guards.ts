/**
 * Centralised server-side role-check helpers.
 *
 * All server functions that need authorisation should import from here instead
 * of defining their own local assertAdmin / assertStaff copies. This is the
 * single source of truth - do NOT duplicate this logic elsewhere.
 *
 * Usage:
 *   import { assertAdmin, assertAdminOrStaff } from "@/lib/auth-guards";
 *   await assertAdmin(context.userId);
 */

/** A row returned by the user_roles table select. */
type RoleRow = { role: string };

/**
 * Resolves the roles for the given userId using the service-role client.
 * Throws if the database query itself fails.
 * Returns an empty array when the user has no role records.
 */
async function getUserRoles(userId: string): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw new Error(`Role lookup failed: ${error.message}`);
  return (data ?? []).map((r: RoleRow) => r.role);
}

/**
 * Asserts that the userId belongs to a user with the "admin" role.
 * Throws "Forbidden" if the user has no roles or is not an admin.
 *
 * SECURITY: Never auto-promotes. A user with no role record is forbidden,
 * not silently elevated. The first admin must be seeded via a Supabase
 * migration (see supabase/migrations/ for seeding patterns).
 */
export async function assertAdmin(userId: string): Promise<void> {
  const roles = await getUserRoles(userId);
  if (!roles.includes("admin")) {
    throw new Error("Forbidden: admin access required.");
  }
}

/**
 * Asserts that the userId belongs to a user with "admin" or "staff" role.
 * Returns { roles, isAdmin } so callers can branch on admin vs. staff without
 * a second DB round-trip.
 */
export async function assertAdminOrStaff(
  userId: string,
): Promise<{ roles: string[]; isAdmin: boolean }> {
  const roles = await getUserRoles(userId);
  if (!roles.includes("admin") && !roles.includes("staff")) {
    throw new Error("Forbidden: admin or staff access required.");
  }
  return { roles, isAdmin: roles.includes("admin") };
}
