import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { ward_id } = body;

    if (!ward_id) {
      return NextResponse.json({ error: "ward_id is required" }, { status: 400 });
    }

    // Check if ward has any occupied cages
    const { data: cages, error: cagesError } = await client
      .from("cage")
      .select("cage_id, cage_status")
      .eq("ward_id", ward_id);

    if (cagesError) {
      return NextResponse.json({ error: cagesError.message }, { status: 500 });
    }

    const occupiedCages = (cages || []).filter((c: any) => c.cage_status === "Occupied");
    if (occupiedCages.length > 0) {
      return NextResponse.json({
        error: `Cannot delete ward. ${occupiedCages.length} cage(s) are still occupied. Remove cats from cages first.`,
        canDelete: false,
      }, { status: 400 });
    }

    // Delete all cages associated with this ward first
    if (cages && cages.length > 0) {
      const { error: deleteCagesError } = await client
        .from("cage")
        .delete()
        .eq("ward_id", ward_id);

      if (deleteCagesError) {
        return NextResponse.json({ error: deleteCagesError.message }, { status: 500 });
      }
    }

    // Delete the ward
    const { error: deleteError } = await client
      .from("ward")
      .delete()
      .eq("ward_id", ward_id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
