import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserDelete } from "@/lib/permissions";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { transaction_id, currentUserEmail } = body;

    if (!transaction_id) return NextResponse.json({ error: "transaction_id required" }, { status: 400 });

    // Check permissions
    if (!currentUserEmail || !(await canUserDelete(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { error } = await client.from("transactions").delete().eq("transaction_id", transaction_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
