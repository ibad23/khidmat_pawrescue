import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cat_name,
      age,
      gender,
      type,
      cage_id,
      status,
      owner_name,
      contact_num,
      address,
      admitted_on,
    } = body;

    // Find or create external (owner/reporter)
    let externalId: number | null = null;
    if (contact_num || owner_name) {
      // try find existing by contact_num first
      if (contact_num) {
        try {
          const { data: existing, error: findErr } = await client
            .from("externals")
            .select("external_id")
            .eq("contact_num", contact_num)
            .limit(1)
            .single();
          if (!findErr && existing && (existing as any).external_id) {
            externalId = (existing as any).external_id;
          }
        } catch (e) {
          // ignore and fall through to create
        }
      }

      if (!externalId) {
        // compute next external_id by reading last primary key
        const { data: lastExt, error: lastExtErr } = await client
          .from("externals")
          .select("external_id")
          .order("external_id", { ascending: false })
          .limit(1)
          .single();
        if (lastExtErr) return NextResponse.json({ error: lastExtErr.message }, { status: 500 });
        const nextExternalId = ((lastExt as any)?.external_id ?? 0) + 1;

        const insertPayload: any = {
          external_id: nextExternalId,
          name: owner_name || null,
          contact_num: contact_num || null,
          address: address || null,
        };

        const { data: extData, error: extErr } = await client
          .from("externals")
          .insert(insertPayload)
          .select("external_id")
          .single();
        if (extErr) return NextResponse.json({ error: extErr.message }, { status: 500 });
        externalId = (extData as any).external_id;
      }
    }

    // Generate next cat_id by looking at last row (note: race conditions possible)
    const { data: lastCat, error: lastErr } = await client
      .from("cats")
      .select("cat_id")
      .order("cat_id", { ascending: false })
      .limit(1)
      .single();
    if (lastErr) return NextResponse.json({ error: lastErr.message }, { status: 501 });
    const nextId = ((lastCat as any)?.cat_id ?? 0) + 1;

    const payload: any = {
      cat_id: nextId,
      cat_name: cat_name || null,
      age: age !== undefined && age !== null ? Number(age) : null,
      gender: gender || null,
      type: type || null,
      cage_id: cage_id ? Number(cage_id) : null,
      external_id: externalId,
      status: status || null,
      admitted_on: admitted_on || new Date().toISOString(),
    };

    const { data, error } = await client
      .from("cats")
      .insert(payload)
      .select(
        `cat_id,cat_name,age,gender,type,cage_id,status,admitted_on,cage(cage_no),externals(external_id,name,contact_num,address)`
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 502 });

    // If cage was assigned, mark cage as Occupied
    if (payload.cage_id) {
      await client.from("cage").update({ cage_status: "Occupied" }).eq("cage_id", payload.cage_id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 503 });
  }
}
