import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/services/userService";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  await requestPasswordReset(email, origin);

  return NextResponse.json({ success: true });
}
