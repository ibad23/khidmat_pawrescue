import { NextRequest, NextResponse } from "next/server";
import adminClient from "../../adminClient";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, roleId, currentUserEmail } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get current user data to check for email change
    const { data: currentUser, error: fetchError } = await adminClient
      .from("users")
      .select("email")
      .eq("user_id", id)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-edit
    if (currentUserEmail && currentUser.email === currentUserEmail) {
      return NextResponse.json(
        { error: "You cannot edit your own account" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.user_name = name;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.internal_role_id = roleId;

    // If email changed, update in Supabase Auth too
    if (email && email !== currentUser.email) {
      // Find auth user by email
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const authUser = authUsers?.users.find((u) => u.email === currentUser.email);

      if (authUser) {
        const { error: authError } = await adminClient.auth.admin.updateUserById(
          authUser.id,
          { email }
        );
        if (authError) {
          console.error("Failed to update auth email:", authError);
          return NextResponse.json(
            { error: `Failed to update email in auth system: ${authError.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Update in database
    const { data: updatedUser, error: updateError } = await adminClient
      .from("users")
      .update(updateData)
      .eq("user_id", id)
      .select(`
        user_id,
        user_name,
        email,
        internal_role_id,
        internal_role:internal_role_id (
          internal_role_id,
          role_desc
        )
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update user: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Map to TeamMember format
    const roleData = Array.isArray(updatedUser.internal_role)
      ? updatedUser.internal_role[0]
      : updatedUser.internal_role;
    const teamMember = {
      id: updatedUser.user_id,
      name: updatedUser.user_name || "",
      email: updatedUser.email || "",
      role: roleData?.role_desc || "Unknown",
      roleId: updatedUser.internal_role_id || 0,
    };

    return NextResponse.json({ data: teamMember });
  } catch (err) {
    console.error("Error updating team member:", err);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}
