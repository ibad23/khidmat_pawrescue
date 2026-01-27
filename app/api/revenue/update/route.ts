import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { revenue_id, name, contact_num, mode, amount, date, remarks } = body;

    if (!revenue_id) return NextResponse.json({ error: "revenue_id required" }, { status: 400 });

    if (name || contact_num) {
      const { data: rev } = await client.from("revenue").select("buyer_id").eq("revenue_id", revenue_id).single();
      if (rev) {
        const extPayload: any = {};
        if (name) extPayload.name = name;
        if (contact_num) extPayload.contact_num = contact_num;
        await client.from("externals").update(extPayload).eq("external_id", rev.buyer_id);
      }
    }

    const payload: any = {};
    if (mode !== undefined) payload.mode = mode;
    if (amount !== undefined) payload.amount = Number(amount);
    if (date !== undefined) payload.date = date;
    if (remarks !== undefined) payload.remarks = remarks;

    if (Object.keys(payload).length > 0) {
      const { error } = await client.from("revenue").update(payload).eq("revenue_id", revenue_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data, error } = await client
      .from("revenue")
      .select(`revenue_id, buyer_id, mode, amount, date, remarks, externals(name, contact_num)`)
      .eq("revenue_id", revenue_id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
