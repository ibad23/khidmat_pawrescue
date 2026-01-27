import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    const { data, error } = await client
      .from("revenue")
      .select(`revenue_id, buyer_id, mode, amount, date, remarks, externals(name, contact_num)`)
      .order("date", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
