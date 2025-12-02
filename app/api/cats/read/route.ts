import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET(req: Request) {
  try {
    const { data, error } = await client
      .from("cats")
      .select(`cat_id,cat_name,cage_id,cage(cage_no)`)
      .order("cat_id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
