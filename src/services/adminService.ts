import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";
import { ServiceError } from "./ServiceError";
import type { ListingStatus } from "@prisma/client";

export async function getListingsByStatus(status: ListingStatus) {
  return prisma.listing.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, lastName: true, email: true } },
    },
  });
}

export async function updateListingStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
  reason?: string
) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!listing) throw new ServiceError("Not found", 404);

  await prisma.listing.update({ where: { id }, data: { status } });

  const transporter = getTransporter();
  if (transporter && listing.user.email) {
    const userName = listing.user.name ?? "there";
    const categoryLabel = listing.category === "WATCH" ? "watch" : "jewelry piece";
    try {
      if (status === "APPROVED") {
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
        const trimmedReason = reason?.trim();
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: listing.user.email,
          subject: "Update on your submitted item",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
              <h2>Hi ${userName},</h2>
              <p>Thank you for submitting your <strong>${listing.brand}</strong> ${categoryLabel}. After careful review, we are unable to list this item at this time.</p>
              ${trimmedReason ? `<p><strong>Reason:</strong> ${trimmedReason}</p>` : ""}
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
}
