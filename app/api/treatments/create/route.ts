import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cat_id, user_id, user_email, date_time, temperature, treatment } = body;

    // Look up user by email if provided
    let resolvedUserId = user_id ? Number(user_id) : null;
    if (!resolvedUserId && user_email) {
      const { data: userData } = await client
        .from("users")
        .select("user_id")
        .eq("email", user_email)
        .single();
      if (userData) {
        resolvedUserId = userData.user_id;
      }
    }

    const payload: any = {
      cat_id: typeof cat_id === "string" ? Number(cat_id) : cat_id,
      user_id: resolvedUserId,
      date_time: date_time || new Date().toISOString(),
      temperature: temperature || null,
      treatment: treatment || null,
    };

    // Check if cat is expired
    const { data: catData, error: catError } = await client
      .from("cats")
      .select("status")
      .eq("cat_id", payload.cat_id)
      .single();

    if (catError) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    if (catData.status.toLowerCase().includes("expired")) {
      return NextResponse.json(
        { error: "Cannot add treatment for an expired cat" },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from("treatment")
      .insert(payload)
      .select(
        `treatment_id,cat_id,user_id,date_time,temperature,treatment,cats(cat_id,cat_name,cage_id,cage(cage_no,ward(code))),users(user_id,user_name)`
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
