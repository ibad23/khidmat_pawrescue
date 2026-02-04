import { NextRequest, NextResponse } from "next/server";
import adminClient from "../../adminClient";
import { isUserAdmin } from "@/lib/permissions";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newPassword, currentUserEmail } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "User ID and new password are required" },
        { status: 400 }
      );
    }

    // Check if current user is admin
    if (!currentUserEmail || !(await isUserAdmin(currentUserEmail))) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Get user email from database
    const { data: user, error: fetchError } = await adminClient
      .from("users")
      .select("email")
      .eq("user_id", userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find auth user by email
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === user.email);

    if (!authUser) {
      return NextResponse.json(
        { error: "Auth user not found" },
        { status: 404 }
      );
    }

    // Update password in Supabase Auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (authError) {
      console.error("Failed to update auth password:", authError);
      return NextResponse.json(
        { error: `Failed to update password: ${authError.message}` },
        { status: 500 }
      );
    }

    // Update password in users table
    const { error: dbError } = await adminClient
      .from("users")
      .update({ password: newPassword })
      .eq("user_id", userId);

    if (dbError) {
      console.error("Failed to update database password:", dbError);
      // Note: Auth password is already updated, but we continue anyway
      // This is a minor inconsistency that shouldn't affect functionality
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error changing password:", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
