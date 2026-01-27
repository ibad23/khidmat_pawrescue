import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
	try {
		// Allow optional query ?cat_id=<numeric> to filter treatments for a cat
		const url = new URL(req.url);
		const catIdParam = url.searchParams.get("cat_id");
		let query = client
			.from("treatment")
			.select(
				`treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no)),users(user_id,user_name)`
			)
			.order("date_time", { ascending: false });

		// If cat_id provided, apply filter
		if (catIdParam) {
			const catIdNum = Number(catIdParam);
			if (!Number.isNaN(catIdNum)) {
				query = query.eq("cat_id", catIdNum);
			}
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
