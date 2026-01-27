import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact_num, address, mode, amount, remarks, date } = body;

    // Upsert external
    let buyer_id: number;
    const { data: existing } = await client
      .from("externals")
      .select("external_id")
      .eq("name", name)
      .eq("contact_num", contact_num)
      .single();

    if (existing) {
      buyer_id = existing.external_id;
    } else {
      const { data: created, error: extErr } = await client
        .from("externals")
        .insert({ name, contact_num: contact_num || null, address: address || null })
        .select("external_id")
        .single();
      if (extErr) return NextResponse.json({ error: extErr.message }, { status: 500 });
      buyer_id = created!.external_id;
    }

    const { data, error } = await client
      .from("revenue")
      .insert({ buyer_id, mode, amount: Number(amount), remarks: remarks || null, date: date || new Date().toISOString().split("T")[0] })
      .select(`revenue_id, buyer_id, mode, amount, date, remarks, externals(name, contact_num)`)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
