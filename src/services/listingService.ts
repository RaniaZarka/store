import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";
import { ServiceError } from "./ServiceError";
import type { Category } from "@prisma/client";

const ADMIN_EMAIL = "raniazarka@hotmail.com";

export async function getUserListings(userId: string) {
  return prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createListing(
  userId: string,
  userName: string | null | undefined,
  userEmail: string | null | undefined,
  brand: string,
  price: number,
  category: Category,
  imageUrl: string | null
) {
  const listing = await prisma.listing.create({
    data: { brand, price, category, imageUrl, userId },
  });

  const transporter = getTransporter();
  if (transporter) {
    const categoryLabel = category === "WATCH" ? "Watch" : "Jewelry";
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `New item submitted — ${brand} (${categoryLabel})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
            <h2>New item pending review</h2>
            <p><strong>Brand:</strong> ${brand}</p>
            <p><strong>Category:</strong> ${categoryLabel}</p>
            <p><strong>Price:</strong> $${price.toLocaleString()}</p>
            <p><strong>Submitted by:</strong> ${userName ?? ""} (${userEmail ?? ""})</p>
            <p style="margin-top:24px;">Log in to the admin panel to review this item.</p>
            <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store System</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Admin notification email failed:", err);
    }
  }

  return listing;
}

export async function deleteListing(id: string, userId: string, role: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) throw new ServiceError("Not found", 404);

  const isOwner = listing.userId === userId;
  const isAdmin = role === "ADMIN";
  if (!isOwner && !isAdmin) throw new ServiceError("Forbidden", 403);

  await prisma.listing.delete({ where: { id } });
}
