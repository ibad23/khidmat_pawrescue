import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    // Get free cages with ward info
    const { data, error } = await client
      .from("cage")
      .select("cage_id, cage_no, ward_id, ward:ward_id(code)")
      .eq("cage_status", "Free")
      .order("ward_id", { ascending: true })
      .order("cage_no", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Map data to include ward_code
    const mapped = (data || []).map((cage: any) => ({
      cage_id: cage.cage_id,
      cage_no: cage.cage_no,
      ward_id: cage.ward_id,
      ward_code: cage.ward?.code || "GW",
    }));

    return NextResponse.json({ data: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
