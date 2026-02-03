import { NextResponse } from "next/server";
import adminClient from "../../adminClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Pagination params
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    // Filter params
    const roleId = url.searchParams.get("role_id");
    const search = url.searchParams.get("search");

    let query = adminClient
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
      `, { count: "exact" });

    // Apply filters
    if (roleId) {
      query = query.eq("internal_role_id", Number(roleId));
    }
    if (search) {
      query = query.or(`user_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("user_id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to TeamMember format
    const teamMembers = (data || []).map((user: any) => {
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

    return NextResponse.json({
      data: teamMembers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching team members:", err);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
