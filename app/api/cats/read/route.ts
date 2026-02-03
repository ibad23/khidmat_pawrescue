import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const catId = url.searchParams.get("cat_id");

		// Pagination params
		const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
		const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
		const offset = (page - 1) * limit;

		// Filter params
		const status = url.searchParams.get("status");
		const gender = url.searchParams.get("gender");
		const type = url.searchParams.get("type");
		const search = url.searchParams.get("search");

		// Base query: select cat fields and join cage and externals information
		let query = client
			.from("cats")
			.select(
				`cat_id,cat_name,age,gender,type,cage_id,status,admitted_on,cage(cage_id,cage_no),externals(external_id,name,contact_num,address)`,
				{ count: "exact" }
			);

		// If cat_id is provided, fetch single cat
		if (catId) {
			query = query.eq("cat_id", Number(catId));
			const { data, error } = await query.single();
			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
			return NextResponse.json({ data });
		}

		// Apply filters
		if (status) {
			query = query.eq("status", status);
		}
		if (gender) {
			query = query.eq("gender", gender);
		}
		if (type) {
			query = query.eq("type", type);
		}
		if (search) {
			query = query.ilike("cat_name", `%${search}%`);
		}

		// Apply pagination and ordering
		const { data, error, count } = await query
			.order("cat_id", { ascending: false })
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
