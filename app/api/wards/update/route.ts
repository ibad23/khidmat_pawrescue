import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ward_id, name, code, totalCages, currentUserEmail } = body;

    if (!ward_id) {
      return NextResponse.json({ error: "ward_id is required" }, { status: 400 });
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Get current ward data and cage counts
    const { data: currentWard, error: currentError } = await client
      .from("ward")
      .select("ward_id, name, code, capacity_cages")
      .eq("ward_id", ward_id)
      .single();

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }

    // Get current cages for this ward
    const { data: currentCages, error: cagesError } = await client
      .from("cage")
      .select("cage_id, cage_no, cage_status")
      .eq("ward_id", ward_id)
      .order("cage_no", { ascending: true });

    if (cagesError) {
      return NextResponse.json({ error: cagesError.message }, { status: 500 });
    }

    const currentCageCount = currentCages?.length || 0;
    const occupiedCages = (currentCages || []).filter((c: any) => c.cage_status === "Occupied");
    const occupiedCount = occupiedCages.length;
    const freeCages = (currentCages || []).filter((c: any) => c.cage_status === "Free");

    // Check if we're trying to reduce below occupied count
    const newCageCount = totalCages !== undefined ? totalCages : currentCageCount;
    if (newCageCount < occupiedCount) {
      return NextResponse.json({
        error: `Cannot reduce cages below ${occupiedCount}. There are ${occupiedCount} occupied cages.`,
      }, { status: 400 });
    }

    // Update ward basic info
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (code !== undefined) updatePayload.code = code;
    if (totalCages !== undefined) updatePayload.capacity_cages = totalCages;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await client
        .from("ward")
        .update(updatePayload)
        .eq("ward_id", ward_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    // Handle cage count changes
    if (totalCages !== undefined && totalCages !== currentCageCount) {
      if (totalCages > currentCageCount) {
        // Add new cages
        const cagesToAdd = totalCages - currentCageCount;
        const { data: lastCage } = await client
          .from("cage")
          .select("cage_id")
          .order("cage_id", { ascending: false })
          .limit(1)
          .single();

        let nextCageId = ((lastCage as any)?.cage_id ?? 0) + 1;
        const today = new Date().toISOString().split("T")[0];

        // Find the max cage_no in this ward
        const maxCageNo = currentCages && currentCages.length > 0
          ? Math.max(...currentCages.map((c: any) => c.cage_no))
          : 0;

        const newCages = [];
        for (let i = 1; i <= cagesToAdd; i++) {
          newCages.push({
            cage_id: nextCageId++,
            ward_id,
            cage_status: "Free",
            date: today,
            cage_no: maxCageNo + i,
          });
        }

        const { error: insertError } = await client.from("cage").insert(newCages);
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      } else if (totalCages < currentCageCount) {
        // Remove free cages (only free ones can be removed)
        const cagesToRemove = currentCageCount - totalCages;

        if (freeCages.length < cagesToRemove) {
          return NextResponse.json({
            error: `Cannot remove ${cagesToRemove} cages. Only ${freeCages.length} cages are free.`,
          }, { status: 400 });
        }

        // Delete from the end (highest cage_no first)
        const cagesToDelete = freeCages
          .sort((a: any, b: any) => b.cage_no - a.cage_no)
          .slice(0, cagesToRemove);

        const idsToDelete = cagesToDelete.map((c: any) => c.cage_id);
        const { error: deleteError } = await client
          .from("cage")
          .delete()
          .in("cage_id", idsToDelete);

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }
    }

    // Return updated ward data
    const finalFreeCages = newCageCount - occupiedCount;

    return NextResponse.json({
      data: {
        ward_id,
        name: name !== undefined ? name : (currentWard as any).name,
        code: code !== undefined ? code : (currentWard as any).code,
        totalCages: newCageCount,
        freeCages: finalFreeCages,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
