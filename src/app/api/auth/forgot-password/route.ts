import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid revealing whether the email exists
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Delete any existing token for this email first
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const origin = new URL(req.url).origin;
  const resetLink = `${origin}/reset-password?token=${token}`;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
            <h2>Reset your password</h2>
            <p>We received a request to reset the password for your account.</p>
            <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#d4af37;color:#111827;text-decoration:none;border-radius:9999px;font-weight:600;">
              Reset Password
            </a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Reset email failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
