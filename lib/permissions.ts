import client from "@/app/api/client";

export type UserRole = "Administrator" | "Moderator" | "Surgeon" | null;

export interface UserPermissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangePassword: boolean;
  isAdmin: boolean;
  role: UserRole;
}

/**
 * Get user role from email (server-side)
 */
export async function getUserRole(email: string): Promise<UserRole> {
  try {
    const { data: userRow, error: userErr } = await client
      .from("users")
      .select("internal_role_id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (userErr || !userRow?.internal_role_id) return null;

    const { data: roleRow, error: roleErr } = await client
      .from("internal_role")
      .select("role_desc")
      .eq("internal_role_id", userRow.internal_role_id)
      .limit(1)
      .maybeSingle();

    if (roleErr || !roleRow) return null;

    return roleRow.role_desc as UserRole;
  } catch {
    return null;
  }
}

/**
 * Get permissions for a user email (server-side)
 */
export async function getUserPermissions(email: string): Promise<UserPermissions> {
  const role = await getUserRole(email);
  const isAdmin = role === "Administrator";

  return {
    canAdd: role !== null,
    canEdit: isAdmin,
    canDelete: isAdmin,
    canChangePassword: isAdmin,
    isAdmin,
    role,
  };
}

/**
 * Check if user has edit permission
 */
export async function canUserEdit(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return role === "Administrator";
}

/**
 * Check if user has delete permission
 */
export async function canUserDelete(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return role === "Administrator";
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  const role = await getUserRole(email);
  return role === "Administrator";
}
