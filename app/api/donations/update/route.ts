import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { donation_id, donor_name, contact_num, mode, amount, date, currentUserEmail } = body;

    if (!donation_id) return NextResponse.json({ error: "donation_id required" }, { status: 400 });

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Update externals if name/contact provided
    if (donor_name || contact_num) {
      const { data: donation } = await client
        .from("donations")
        .select("donor_id")
        .eq("donation_id", donation_id)
        .single();

      if (donation) {
        const extPayload: any = {};
        if (donor_name) extPayload.name = donor_name;
        if (contact_num) extPayload.contact_num = contact_num;
        await client.from("externals").update(extPayload).eq("external_id", donation.donor_id);
      }
    }

    const payload: any = {};
    if (mode !== undefined) payload.mode = mode;
    if (amount !== undefined) payload.amount = Number(amount);
    if (date !== undefined) payload.date = date;

    if (Object.keys(payload).length > 0) {
      const { error } = await client.from("donations").update(payload).eq("donation_id", donation_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data, error } = await client
      .from("donations")
      .select(`donation_id, donor_id, mode, amount, date, externals(name, contact_num)`)
      .eq("donation_id", donation_id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
