import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";
import type { ListingStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as { status: ListingStatus; reason?: string };

  const validStatuses: ListingStatus[] = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // DB update always happens first — email failure must never block this
  await prisma.listing.update({
    where: { id },
    data: { status: body.status },
  });

  const transporter = getTransporter();
  if (transporter && listing.user.email) {
    const userName = listing.user.name ?? "there";
    const categoryLabel = listing.category === "WATCH" ? "watch" : "jewelry piece";

    try {
      if (body.status === "APPROVED") {
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: listing.user.email,
          subject: "Your item has been approved!",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
              <h2 style="color:#d4af37;">Great news, ${userName}!</h2>
              <p>Your <strong>${listing.brand}</strong> ${categoryLabel} listed at <strong>$${listing.price.toLocaleString()}</strong> has been <strong>approved</strong> and is now live on our store.</p>
              <p>Thank you for choosing us to sell your luxury item.</p>
              <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store Team</p>
            </div>
          `,
        });
      } else {
        const reason = body.reason?.trim();
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: listing.user.email,
          subject: "Update on your submitted item",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
              <h2>Hi ${userName},</h2>
              <p>Thank you for submitting your <strong>${listing.brand}</strong> ${categoryLabel}. After careful review, we are unable to list this item at this time.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
              <p>You are welcome to submit another item or contact us if you have any questions.</p>
              <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store Team</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
