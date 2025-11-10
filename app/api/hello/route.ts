import { NextResponse } from "next/server";

export async function GET() {

    // database functions will be called here in the future

  return NextResponse.json({ message: "Hello, world!" });
}
