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
      .from("transactions")
      .select(`transaction_id, mode, amount, bill_for, date, remarks`, { count: "exact" });

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
    if (search) {
      query = query.or(`bill_for.ilike.%${search}%,remarks.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
