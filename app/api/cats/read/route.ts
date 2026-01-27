import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const catId = url.searchParams.get("cat_id");

		// Base query: select cat fields and join cage and externals information
		let query = client
			.from("cats")
			.select(
				`cat_id,cat_name,age,gender,type,cage_id,status,admitted_on,cage(cage_id,cage_no),externals(external_id,name,contact_num,address)`
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

		// Otherwise return all cats ordered by cat_id descending
		const { data, error } = await query.order("cat_id", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
