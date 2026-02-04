import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserDelete } from "@/lib/permissions";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { revenue_id, currentUserEmail } = body;

    if (!revenue_id) return NextResponse.json({ error: "revenue_id required" }, { status: 400 });

    // Check permissions
    if (!currentUserEmail || !(await canUserDelete(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { error } = await client.from("revenue").delete().eq("revenue_id", revenue_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
