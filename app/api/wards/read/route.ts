import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wardId = url.searchParams.get("ward_id");
    const wardName = url.searchParams.get("name");

    // If ward_id or name is provided, fetch single ward
    if (wardId || wardName) {
      let query = client.from("ward").select("ward_id, name, code, capacity_cages");

      if (wardId) {
        query = query.eq("ward_id", Number(wardId));
      } else if (wardName) {
        // Convert slug back to name (e.g., "general-ward" -> "General Ward")
        const decodedName = wardName.split("-").map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
        query = query.ilike("name", decodedName);
      }

      const { data: ward, error: wardError } = await query.single();

      if (wardError) {
        return NextResponse.json({ error: wardError.message }, { status: 500 });
      }

      // Get cage counts
      const { data: cages, error: cagesError } = await client
        .from("cage")
        .select("cage_id, cage_status")
        .eq("ward_id", (ward as any).ward_id);

      if (cagesError) {
        return NextResponse.json({ error: cagesError.message }, { status: 500 });
      }

      const totalCages = cages?.length || 0;
      const freeCages = cages?.filter((c: any) => c.cage_status === "Free").length || 0;

      return NextResponse.json({
        data: {
          ward_id: (ward as any).ward_id,
          name: (ward as any).name,
          code: (ward as any).code,
          totalCages,
          freeCages,
        },
      });
    }

    // Fetch all wards
    const { data: wards, error: wardsError } = await client
      .from("ward")
      .select("ward_id, name, code, capacity_cages")
      .order("ward_id", { ascending: true });

    if (wardsError) {
      return NextResponse.json({ error: wardsError.message }, { status: 500 });
    }

    // Get all cages grouped by ward
    const { data: allCages, error: cagesError } = await client
      .from("cage")
      .select("ward_id, cage_status");

    if (cagesError) {
      return NextResponse.json({ error: cagesError.message }, { status: 500 });
    }

    // Calculate cage counts per ward
    const wardData = (wards || []).map((ward: any) => {
      const wardCages = (allCages || []).filter((c: any) => c.ward_id === ward.ward_id);
      const totalCages = wardCages.length;
      const freeCages = wardCages.filter((c: any) => c.cage_status === "Free").length;

      return {
        ward_id: ward.ward_id,
        name: ward.name,
        code: ward.code,
        totalCages,
        freeCages,
      };
    });

    return NextResponse.json({ data: wardData });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
