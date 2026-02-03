import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { cage_id } = body;

    if (!cage_id) {
      return NextResponse.json({ error: "cage_id is required" }, { status: 400 });
    }

    // Check if cage exists and is free
    const { data: cage, error: cageError } = await client
      .from("cage")
      .select("cage_id, cage_status, ward_id")
      .eq("cage_id", cage_id)
      .single();

    if (cageError) {
      return NextResponse.json({ error: cageError.message }, { status: 500 });
    }

    if ((cage as any).cage_status === "Occupied") {
      return NextResponse.json({
        error: "Cannot delete occupied cage. Remove the cat first.",
      }, { status: 400 });
    }

    // Delete the cage
    const { error: deleteError } = await client
      .from("cage")
      .delete()
      .eq("cage_id", cage_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update ward capacity
    const wardId = (cage as any).ward_id;
    if (wardId) {
      const { data: wardData } = await client
        .from("ward")
        .select("capacity_cages")
        .eq("ward_id", wardId)
        .single();

      if (wardData) {
        await client
          .from("ward")
          .update({ capacity_cages: Math.max(0, ((wardData as any).capacity_cages || 1) - 1) })
          .eq("ward_id", wardId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
