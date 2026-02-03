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
		const catIdParam = url.searchParams.get("cat_id");
		const userId = url.searchParams.get("user_id");
		const dateFrom = url.searchParams.get("date_from");
		const dateTo = url.searchParams.get("date_to");
		const search = url.searchParams.get("search");

		let query = client
			.from("treatment")
			.select(
				`treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no)),users(user_id,user_name)`,
				{ count: "exact" }
			);

		// Apply filters
		if (catIdParam) {
			const catIdNum = Number(catIdParam);
			if (!Number.isNaN(catIdNum)) {
				query = query.eq("cat_id", catIdNum);
			}
		}
		if (userId) {
			query = query.eq("user_id", Number(userId));
		}
		if (dateFrom) {
			query = query.gte("date_time", dateFrom);
		}
		if (dateTo) {
			query = query.lte("date_time", dateTo);
		}
		if (search) {
			query = query.ilike("treatment", `%${search}%`);
		}

		const { data, error, count } = await query
			.order("date_time", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

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
