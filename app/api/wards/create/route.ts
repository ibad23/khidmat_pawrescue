import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, totalCages } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "name and code are required" }, { status: 400 });
    }

    // Generate next ward_id
    const { data: lastWard, error: lastErr } = await client
      .from("ward")
      .select("ward_id")
      .order("ward_id", { ascending: false })
      .limit(1)
      .single();

    // Handle case where no wards exist yet
    const nextWardId = lastErr && lastErr.code === "PGRST116" ? 1 : ((lastWard as any)?.ward_id ?? 0) + 1;

    // Create the ward
    const { data: wardData, error: wardError } = await client
      .from("ward")
      .insert({
        ward_id: nextWardId,
        name,
        code,
        capacity_cages: totalCages || 0,
      })
      .select()
      .single();

    if (wardError) {
      return NextResponse.json({ error: wardError.message }, { status: 500 });
    }

    // Create cages for this ward
    const cageCount = totalCages || 0;
    if (cageCount > 0) {
      // Get the last cage_id to generate new ones
      const { data: lastCage } = await client
        .from("cage")
        .select("cage_id")
        .order("cage_id", { ascending: false })
        .limit(1)
        .single();

      let nextCageId = ((lastCage as any)?.cage_id ?? 0) + 1;
      const today = new Date().toISOString().split("T")[0];

      const cagesToInsert = [];
      for (let i = 1; i <= cageCount; i++) {
        cagesToInsert.push({
          cage_id: nextCageId++,
          ward_id: nextWardId,
          cage_status: "Free",
          date: today,
          cage_no: i,
        });
      }

      const { error: cagesError } = await client.from("cage").insert(cagesToInsert);

      if (cagesError) {
        // Rollback: delete the ward if cages failed
        await client.from("ward").delete().eq("ward_id", nextWardId);
        return NextResponse.json({ error: cagesError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      data: {
        ward_id: nextWardId,
        name,
        code,
        totalCages: cageCount,
        freeCages: cageCount,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
