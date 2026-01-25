import { NextRequest, NextResponse } from "next/server";
import adminClient from "../../adminClient";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const currentUserEmail = searchParams.get("currentUserEmail");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user email before deletion (needed to find auth user and check self-delete)
    const { data: user, error: fetchError } = await adminClient
      .from("users")
      .select("email")
      .eq("user_id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (currentUserEmail && user.email === currentUserEmail) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      );
    }

    // Delete from users table first
    const { error: dbError } = await adminClient
      .from("users")
      .delete()
      .eq("user_id", id);

    if (dbError) {
      return NextResponse.json(
        { error: `Failed to delete user from database: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Delete from Supabase Auth
    // Find auth user by email
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === user.email);

    if (authUser) {
      const { error: authError } = await adminClient.auth.admin.deleteUser(authUser.id);
      if (authError) {
        console.error("Failed to delete auth user:", authError);
        // User is already deleted from DB, so we log but don't fail the request
      }
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting team member:", err);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
