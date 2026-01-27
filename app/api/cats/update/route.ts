import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      cat_id,
      cat_name,
      age,
      gender,
      type,
      cage_id,
      status,
      owner_name,
      contact_num,
      address,
      old_cage_id,
    } = body;

    if (!cat_id) {
      return NextResponse.json({ error: "cat_id is required" }, { status: 400 });
    }

    // Get the current cat to check existing external
    const { data: currentCat, error: currentCatErr } = await client
      .from("cats")
      .select("external_id,cage_id")
      .eq("cat_id", cat_id)
      .single();

    if (currentCatErr) {
      return NextResponse.json({ error: currentCatErr.message }, { status: 500 });
    }

    // Handle external (owner/reporter) update
    let externalId: number | null = currentCat?.external_id || null;
    if (contact_num || owner_name) {
      // Check if external with this contact exists
      if (contact_num) {
        const { data: existing } = await client
          .from("externals")
          .select("external_id")
          .eq("contact_num", contact_num)
          .limit(1)
          .single();

        if (existing?.external_id) {
          externalId = existing.external_id;
          // Update existing external's info
          await client
            .from("externals")
            .update({
              name: owner_name || null,
              address: address || null,
            })
            .eq("external_id", externalId);
        }
      }

      // If no existing external found, create new one
      if (!externalId || (externalId === currentCat?.external_id && contact_num)) {
        // Check if we should update existing or create new
        if (externalId) {
          await client
            .from("externals")
            .update({
              name: owner_name || null,
              contact_num: contact_num || null,
              address: address || null,
            })
            .eq("external_id", externalId);
        } else {
          // Create new external
          const { data: lastExt } = await client
            .from("externals")
            .select("external_id")
            .order("external_id", { ascending: false })
            .limit(1)
            .single();

          const nextExternalId = ((lastExt as any)?.external_id ?? 0) + 1;

          const { data: newExt, error: newExtErr } = await client
            .from("externals")
            .insert({
              external_id: nextExternalId,
              name: owner_name || null,
              contact_num: contact_num || null,
              address: address || null,
            })
            .select("external_id")
            .single();

          if (newExtErr) {
            return NextResponse.json({ error: newExtErr.message }, { status: 500 });
          }
          externalId = newExt?.external_id || null;
        }
      }
    }

    // Build update payload
    const updatePayload: any = {};
    if (cat_name !== undefined) updatePayload.cat_name = cat_name;
    if (age !== undefined) updatePayload.age = age !== null ? Number(age) : null;
    if (gender !== undefined) updatePayload.gender = gender;
    if (type !== undefined) updatePayload.type = type;
    if (cage_id !== undefined) updatePayload.cage_id = cage_id ? Number(cage_id) : null;
    if (status !== undefined) updatePayload.status = status;
    if (externalId !== undefined) updatePayload.external_id = externalId;

    // Update cat
    const { data, error } = await client
      .from("cats")
      .update(updatePayload)
      .eq("cat_id", cat_id)
      .select(
        `cat_id,cat_name,age,gender,type,cage_id,status,admitted_on,cage(cage_no),externals(external_id,name,contact_num,address)`
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle cage status changes
    const previousCageId = old_cage_id || currentCat?.cage_id;
    const newCageId = updatePayload.cage_id;

    // If cage changed, update cage statuses
    if (previousCageId !== newCageId) {
      // Free up the old cage if it was set
      if (previousCageId) {
        await client
          .from("cage")
          .update({ cage_status: "Free" })
          .eq("cage_id", previousCageId);
      }
      // Mark new cage as occupied if set
      if (newCageId) {
        await client
          .from("cage")
          .update({ cage_status: "Occupied" })
          .eq("cage_id", newCageId);
      }
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
