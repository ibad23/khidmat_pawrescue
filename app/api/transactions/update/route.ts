import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { transaction_id, bill_for, mode, amount, date, remarks, currentUserEmail } = body;

    if (!transaction_id) return NextResponse.json({ error: "transaction_id required" }, { status: 400 });

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const payload: any = {};
    if (bill_for !== undefined) payload.bill_for = bill_for;
    if (mode !== undefined) payload.mode = mode;
    if (amount !== undefined) payload.amount = Number(amount);
    if (date !== undefined) payload.date = date;
    if (remarks !== undefined) payload.remarks = remarks;

    const { data, error } = await client
      .from("transactions")
      .update(payload)
      .eq("transaction_id", transaction_id)
      .select(`transaction_id, mode, amount, bill_for, date, remarks`)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
