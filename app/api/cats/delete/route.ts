import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserDelete } from "@/lib/permissions";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { cat_id, currentUserEmail } = body;

    if (!cat_id) {
      return NextResponse.json({ error: "cat_id is required" }, { status: 400 });
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserDelete(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Get the cat's cage_id before deleting
    const { data: cat, error: fetchErr } = await client
      .from("cats")
      .select("cage_id")
      .eq("cat_id", cat_id)
      .single();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    // Delete the cat
    const { error } = await client
      .from("cats")
      .delete()
      .eq("cat_id", cat_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Free up the cage if it was assigned
    if (cat?.cage_id) {
      await client
        .from("cage")
        .update({ cage_status: "Free" })
        .eq("cage_id", cat.cage_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
