import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTransporter, EMAIL_FROM } from "@/lib/mailer";
import type { Category } from "@prisma/client";

const ADMIN_EMAIL = "raniazarka@hotmail.com";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const brand = formData.get("brand");
  const price = formData.get("price");
  const categoryRaw = formData.get("category");
  const picture = formData.get("picture");

  if (typeof brand !== "string" || brand.trim() === "") {
    return NextResponse.json({ error: "Brand is required" }, { status: 400 });
  }

  const priceNum = parseFloat(typeof price === "string" ? price : "");
  if (isNaN(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
  }

  const validCategories: Category[] = ["WATCH", "JEWELRY"];
  if (typeof categoryRaw !== "string" || !validCategories.includes(categoryRaw as Category)) {
    return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
  }
  const category = categoryRaw as Category;

  let imageUrl: string | null = null;
  if (picture instanceof File && picture.size > 0) {
    const bytes = await picture.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    imageUrl = `data:${picture.type};base64,${base64}`;
  }

  const listing = await prisma.listing.create({
    data: {
      brand: brand.trim(),
      price: priceNum,
      category,
      imageUrl,
      userId: session.user.id,
    },
  });

  const transporter = getTransporter();
  if (transporter) {
    const categoryLabel = category === "WATCH" ? "Watch" : "Jewelry";
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `New item submitted — ${brand.trim()} (${categoryLabel})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
            <h2>New item pending review</h2>
            <p><strong>Brand:</strong> ${brand.trim()}</p>
            <p><strong>Category:</strong> ${categoryLabel}</p>
            <p><strong>Price:</strong> $${priceNum.toLocaleString()}</p>
            <p><strong>Submitted by:</strong> ${session.user.name ?? ""} (${session.user.email ?? ""})</p>
            <p style="margin-top:24px;">Log in to the admin panel to review this item.</p>
            <p style="color:#64748b;font-size:13px;margin-top:32px;">— The Store System</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Admin notification email failed:", err);
    }
  }

  return NextResponse.json({ listing }, { status: 201 });
}
