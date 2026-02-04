import { NextResponse } from "next/server";
import client from "@/app/api/client";
import { canUserEdit } from "@/lib/permissions";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { treatment_id, cat_id, temperature, treatment, date_time, currentUserEmail } = body;

    if (!treatment_id) {
      return NextResponse.json({ error: "treatment_id required" }, { status: 400 });
    }

    // Check permissions
    if (!currentUserEmail || !(await canUserEdit(currentUserEmail))) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const id = Number(treatment_id);
    const payload: any = {};

    // Add fields if they are provided in request
    if (cat_id !== undefined) payload.cat_id = Number(cat_id);
    if (temperature !== undefined) payload.temperature = temperature;
    if (treatment !== undefined) payload.treatment = treatment;
    if (date_time !== undefined) payload.date_time = date_time;

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
