import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json() as { token: unknown; password: unknown };
  const { token, password } = body;
  console.log("[reset-password] received token type:", typeof token, "| value:", typeof token === "string" ? token.slice(0, 8) + "…" : token);

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

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: record.identifier,
        subject: "Your password has been changed",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
            <h2>Password updated</h2>
            <p>Your password for <strong>${record.identifier}</strong> was successfully changed.</p>
            <p>If you did not make this change, please contact us immediately.</p>
            <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Password reset confirmation email failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
