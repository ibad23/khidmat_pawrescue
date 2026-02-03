import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Pagination params
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    // Filter params
    const mode = url.searchParams.get("mode");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const search = url.searchParams.get("search");

    let query = client
      .from("donations")
      .select(`donation_id, donor_id, mode, amount, date, externals(name, contact_num)`, { count: "exact" });

    // Apply filters
    if (mode) {
      query = query.eq("mode", mode);
    }
    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    const { data, error, count } = await query
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If search param provided, filter by donor name client-side (since it's a joined table)
    let filteredData = data;
    if (search && data) {
      const searchLower = search.toLowerCase();
      filteredData = data.filter((d: any) =>
        d.externals?.name?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      data: filteredData,
      pagination: {
        page,
        limit,
        total: search ? filteredData?.length || 0 : count || 0,
        totalPages: Math.ceil((search ? filteredData?.length || 0 : count || 0) / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
