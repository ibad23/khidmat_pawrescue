import { NextResponse } from "next/server";
import client from "@/app/api/client";

// PATCH endpoint to update a treatment record]
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { treatment_id, cat_id, temperature, treatment } = body;

    // Check if treatment_id is provided
    if (!treatment_id) {
      return NextResponse.json({ error: "treatment_id required" }, { status: 400 });
    }

    // Convert treatment_id to number and update record
    const id = Number(treatment_id);
    const payload: any = {
      date_time: new Date().toISOString(),
    };

    // Add fields if they are provided in request
    if (cat_id !== undefined) payload.cat_id = Number(cat_id);
    if (temperature !== undefined) payload.temperature = temperature;
    if (treatment !== undefined) payload.treatment = treatment;

    // Update the record in database
    const { data, error } = await client
      .from("treatment")
      .update(payload)
      .eq("treatment_id", id)
      .select(
        `treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no)),users(user_id,user_name)`
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
