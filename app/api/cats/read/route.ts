import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);

		// Base query: select cat fields and join cage and externals information
		const query = client
			.from("cats")
			.select(
				`cat_id,cat_name,age,gender,type,cage_id,status,admitted_on,cage(cage_no),externals(external_id,name,contact_num,address)`
			)
			.order("cat_id", { ascending: false });

		// Optionally allow filtering by status or search query in future via url.searchParams
		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
