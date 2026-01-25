import { NextResponse } from "next/server";
import client from "../../client";

export async function GET() {
  try {
    const { data, error } = await client
      .from("internal_role")
      .select("internal_role_id, role_desc")
      .order("internal_role_id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching internal roles:", err);
    return NextResponse.json(
      { error: "Failed to fetch internal roles" },
      { status: 500 }
    );
  }
}
