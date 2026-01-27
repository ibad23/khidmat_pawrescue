import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    const { data, error } = await client
      .from("transactions")
      .select(`transaction_id, mode, amount, bill_for, date, remarks`)
      .order("date", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
