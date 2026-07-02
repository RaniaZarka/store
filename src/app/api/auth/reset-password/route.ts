import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json() as { token: string; password: string };

  if (typeof token !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findFirst({ where: { token } });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.identifier },
    data: { password: hashed },
  });

  await prisma.verificationToken.deleteMany({ where: { token } });

  return NextResponse.json({ success: true });
}
