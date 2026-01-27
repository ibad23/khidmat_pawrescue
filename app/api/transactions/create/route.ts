import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bill_for, mode, amount, remarks, date } = body;

    const { data, error } = await client
      .from("transactions")
      .insert({
        bill_for,
        mode,
        amount: Number(amount),
        remarks: remarks || null,
        date: date || new Date().toISOString().split("T")[0],
      })
      .select(`transaction_id, mode, amount, bill_for, date, remarks`)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
