import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
	try {
		const { data, error } = await client
			.from("treatment")
			.select(
				`treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no)),users(user_id,user_name)`
			)
			.order("date_time", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
