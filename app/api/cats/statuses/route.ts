import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    const { data, error } = await client.from("cats").select("status");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const statuses = Array.from(new Set((data || []).map((r: any) => r.status).filter(Boolean)));
    return NextResponse.json({ data: statuses });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
