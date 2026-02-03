import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wardId = url.searchParams.get("ward_id");
    const status = url.searchParams.get("status");

    if (!wardId) {
      return NextResponse.json({ error: "ward_id is required" }, { status: 400 });
    }

    // Get ward info
    const { data: ward, error: wardError } = await client
      .from("ward")
      .select("ward_id, name, code")
      .eq("ward_id", Number(wardId))
      .single();

    if (wardError) {
      return NextResponse.json({ error: wardError.message }, { status: 500 });
    }

    // Build cage query
    let query = client
      .from("cage")
      .select("cage_id, cage_no, ward_id, cage_status, date")
      .eq("ward_id", Number(wardId))
      .order("cage_no", { ascending: true });

    if (status) {
      query = query.eq("cage_status", status);
    }

    const { data: cages, error: cagesError } = await query;

    if (cagesError) {
      return NextResponse.json({ error: cagesError.message }, { status: 500 });
    }

    // Get cats that are in these cages
    const cageIds = (cages || []).map((c: any) => c.cage_id);
    let catsData: any[] = [];

    if (cageIds.length > 0) {
      const { data: cats, error: catsError } = await client
        .from("cats")
        .select("cat_id, cat_name, cage_id, admitted_on")
        .in("cage_id", cageIds);

      if (catsError) {
        return NextResponse.json({ error: catsError.message }, { status: 500 });
      }
      catsData = cats || [];
    }

    // Combine cage data with cat info
    const cageDetails = (cages || []).map((cage: any) => {
      const cat = catsData.find((c: any) => c.cage_id === cage.cage_id);
      return {
        cage_id: cage.cage_id,
        cage_no: cage.cage_no,
        ward_id: cage.ward_id,
        ward_code: (ward as any).code,
        cage_status: cage.cage_status,
        date: cat?.admitted_on || cage.date,
        cat_id: cat?.cat_id || null,
        cat_name: cat?.cat_name || null,
      };
    });

    return NextResponse.json({
      data: cageDetails,
      ward: {
        ward_id: (ward as any).ward_id,
        name: (ward as any).name,
        code: (ward as any).code,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
