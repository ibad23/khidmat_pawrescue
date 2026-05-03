import { NextResponse } from "next/server";
import client from "@/app/api/client";

export async function GET() {
  try {
    const statuses = [
      "Under Treatment",
      "Expired",
      "Discharged",
      "Adopted",
      "Ready to discharge"
    ];
    return NextResponse.json({ data: statuses });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
