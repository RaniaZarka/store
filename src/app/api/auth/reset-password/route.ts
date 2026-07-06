import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/services/userService";
import { ServiceError } from "@/services/ServiceError";

export async function POST(req: NextRequest) {
  const body = await req.json() as { token: unknown; password: unknown };
  const { token, password } = body;
  console.log("[reset-password] received token type:", typeof token, "| value:", typeof token === "string" ? token.slice(0, 8) + "…" : token);

  if (typeof token !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await resetPassword(token, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
