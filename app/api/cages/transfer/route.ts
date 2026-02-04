import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cage_id, target_ward_id, currentUserEmail } = body;

    if (!cage_id || !target_ward_id) {
      return NextResponse.json({
        error: "cage_id and target_ward_id are required",
      }, { status: 400 });
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Check if cage exists and is free
    const { data: cage, error: cageError } = await client
      .from("cage")
      .select("cage_id, cage_status, ward_id, cage_no")
      .eq("cage_id", cage_id)
      .single();

    if (cageError) {
      return NextResponse.json({ error: cageError.message }, { status: 500 });
    }

    if ((cage as any).cage_status === "Occupied") {
      return NextResponse.json({
        error: "Cannot transfer occupied cage. Remove the cat first.",
      }, { status: 400 });
    }

    const sourceWardId = (cage as any).ward_id;
    if (sourceWardId === target_ward_id) {
      return NextResponse.json({
        error: "Cage is already in the target ward.",
      }, { status: 400 });
    }

    // Check if target ward exists
    const { data: targetWard, error: targetWardError } = await client
      .from("ward")
      .select("ward_id, capacity_cages")
      .eq("ward_id", target_ward_id)
      .single();

    if (targetWardError) {
      return NextResponse.json({ error: "Target ward not found" }, { status: 404 });
    }

    // Get the max cage_no in the target ward
    const { data: targetCages } = await client
      .from("cage")
      .select("cage_no")
      .eq("ward_id", target_ward_id)
      .order("cage_no", { ascending: false })
      .limit(1);

    const newCageNo = targetCages && targetCages.length > 0
      ? (targetCages[0] as any).cage_no + 1
      : 1;

    // Update the cage to new ward
    const { error: updateError } = await client
      .from("cage")
      .update({
        ward_id: target_ward_id,
        cage_no: newCageNo,
        cage_status: "Free", // Transferred cages become free
      })
      .eq("cage_id", cage_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update ward capacities
    // Decrease source ward capacity
    if (sourceWardId) {
      const { data: sourceWard } = await client
        .from("ward")
        .select("capacity_cages")
        .eq("ward_id", sourceWardId)
        .single();

      if (sourceWard) {
        await client
          .from("ward")
          .update({ capacity_cages: Math.max(0, ((sourceWard as any).capacity_cages || 1) - 1) })
          .eq("ward_id", sourceWardId);
      }
    }

    // Increase target ward capacity
    await client
      .from("ward")
      .update({ capacity_cages: ((targetWard as any).capacity_cages || 0) + 1 })
      .eq("ward_id", target_ward_id);

    return NextResponse.json({
      success: true,
      data: {
        cage_id,
        new_ward_id: target_ward_id,
        new_cage_no: newCageNo,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
