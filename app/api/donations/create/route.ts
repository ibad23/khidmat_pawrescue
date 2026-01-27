import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donor_name, contact_num, address, mode, amount, date } = body;

    // Upsert external
    let donor_id: number;
    const { data: existing } = await client
      .from("externals")
      .select("external_id")
      .eq("name", donor_name)
      .eq("contact_num", contact_num)
      .single();

    if (existing) {
      donor_id = existing.external_id;
    } else {
      const { data: created, error: extErr } = await client
        .from("externals")
        .insert({ name: donor_name, contact_num: contact_num || null, address: address || null })
        .select("external_id")
        .single();
      if (extErr) return NextResponse.json({ error: extErr.message }, { status: 500 });
      donor_id = created!.external_id;
    }

    const { data, error } = await client
      .from("donations")
      .insert({ donor_id, mode, amount: Number(amount), date: date || new Date().toISOString().split("T")[0] })
      .select(`donation_id, donor_id, mode, amount, date, externals(name, contact_num)`)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
