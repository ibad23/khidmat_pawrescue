import { NextRequest, NextResponse } from "next/server";
import client from "../../client";
import adminClient from "../../adminClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, roleId, password } = body;

    // Validate required fields
    if (!name || !email || !roleId || !password) {
      return NextResponse.json(
        { error: "Name, email, role, and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists in users table
    const { data: existingUser } = await client
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    // Insert into users table
    const { data: newUser, error: dbError } = await client
      .from("users")
      .insert({
        user_name: name,
        email,
        password,
        internal_role_id: roleId,
      })
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

    if (dbError) {
      // Rollback: delete the auth user if DB insert fails
      console.error("DB error, rolling back auth user:", dbError);
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: `Failed to create user in database: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Map to TeamMember format
    const roleData = Array.isArray(newUser.internal_role)
      ? newUser.internal_role[0]
      : newUser.internal_role;
    const teamMember = {
      id: newUser.user_id,
      name: newUser.user_name || "",
      email: newUser.email || "",
      role: roleData?.role_desc || "Unknown",
      roleId: newUser.internal_role_id || 0,
    };

    return NextResponse.json({ data: teamMember });
  } catch (err) {
    console.error("Error creating team member:", err);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
