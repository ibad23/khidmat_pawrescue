import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { donation_id } = body;

    if (!donation_id) return NextResponse.json({ error: "donation_id required" }, { status: 400 });

    const { error } = await client.from("donations").delete().eq("donation_id", donation_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
