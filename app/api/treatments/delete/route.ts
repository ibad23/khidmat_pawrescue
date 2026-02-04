import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserDelete } from "@/lib/permissions";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { treatment_id, id: idFallback, currentUserEmail } = body;

    // Accept treatment_id from body or as fallback `id`
    const treatmentId = treatment_id ?? idFallback;

    if (!treatmentId) {
      return NextResponse.json({ error: "treatment_id required" }, { status: 400 });
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserDelete(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const treatmentIdNum = typeof treatmentId === "string" ? Number(treatmentId) : treatmentId;
    if (!Number.isFinite(treatmentIdNum) || treatmentIdNum <= 0) {
      return NextResponse.json({ error: "invalid treatment_id" }, { status: 400 });
    }

    const { error } = await client
      .from("treatment")
      .delete()
      .eq("treatment_id", treatmentIdNum);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
