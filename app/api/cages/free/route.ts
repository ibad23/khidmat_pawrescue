import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    const { data, error } = await client
      .from("cage")
      .select("cage_id,cage_no")
      .eq("cage_status", "Free")
      .order("cage_no", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
