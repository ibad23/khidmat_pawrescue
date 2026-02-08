import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    // query
    const resp = await client
      .from("users")
      .select(("user_name, internal_role_id") as any)
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    const userRow = (resp as any).data as any;
    const userErr = (resp as any).error;
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
    if (!userRow) return NextResponse.json({ error: "not found" }, { status: 404 });

    // lookup role_desc
    let roleDesc: string | null = null;
    if (userRow.internal_role_id) {
      const { data: roleRow, error: roleErr } = await client
        .from("internal_role")
        .select("role_desc")
        .eq("internal_role_id", userRow.internal_role_id)
        .limit(1)
        .maybeSingle();
      if (!roleErr && roleRow) roleDesc = roleRow.role_desc ?? null;
    }

    return NextResponse.json({ user: { name: userRow.user_name ?? null, role: roleDesc } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
