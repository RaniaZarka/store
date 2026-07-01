import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

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

  return NextResponse.json({ listing }, { status: 201 });
}
