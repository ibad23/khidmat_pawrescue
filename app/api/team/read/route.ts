import { NextResponse } from "next/server";
import adminClient from "../../adminClient";

export async function GET() {
  try {
    const { data, error } = await adminClient
      .from("users")
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
      .order("user_id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to TeamMember format
    const teamMembers = data.map((user: any) => {
      const roleData = Array.isArray(user.internal_role)
        ? user.internal_role[0]
        : user.internal_role;
      return {
        id: user.user_id,
        name: user.user_name || "",
        email: user.email || "",
        role: roleData?.role_desc || "Unknown",
        roleId: user.internal_role_id || 0,
      };
    });

    return NextResponse.json({ data: teamMembers });
  } catch (err) {
    console.error("Error fetching team members:", err);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
