import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";
import { ServiceError } from "./ServiceError";

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return null;
  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

export async function registerUser(
  name: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  if (!name || !lastName || !email || !password || !confirmPassword) {
    throw new ServiceError("Missing required fields.");
  }
  if (password.length < 8) {
    throw new ServiceError("Password must be at least 8 characters long.");
  }
  if (password !== confirmPassword) {
    throw new ServiceError("Passwords do not match.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ServiceError("An account with this email already exists.", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, lastName, email, password: hashed },
  });
}

export async function requestPasswordReset(email: string, origin: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silent — don't reveal whether the email exists

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

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
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8) {
    throw new ServiceError("Password must be at least 8 characters");
  }

  const record = await prisma.verificationToken.findFirst({ where: { token } });
  if (!record) {
    throw new ServiceError("Invalid or expired reset link");
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    throw new ServiceError("Reset link has expired. Please request a new one.");
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
}
