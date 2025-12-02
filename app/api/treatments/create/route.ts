import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cat_id, user_id, date_time, temperature, treatment } = body;

    // cast numeric values and insert
    const payload: any = {
      cat_id: typeof cat_id === "string" ? Number(cat_id) : cat_id,
      user_id: user_id ? Number(user_id) : null,
      date_time: date_time || new Date().toISOString(),
      temperature: temperature || null,
      treatment: treatment || null,
    };

    const { data, error } = await client
      .from("treatment")
      .insert(payload)
      .select(
        `treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no)),users(user_id,user_name)`
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
