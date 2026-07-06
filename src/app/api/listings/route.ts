import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserListings, createListing } from "@/services/listingService";
import type { Category } from "@prisma/client";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const listings = await getUserListings(session.user.id);
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
  const imageUrlField = formData.get("imageUrl");

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

  const imageUrl =
    typeof imageUrlField === "string" && imageUrlField.startsWith("data:")
      ? imageUrlField
      : null;

  const listing = await createListing(
    session.user.id,
    session.user.name,
    session.user.email,
    brand.trim(),
    priceNum,
    category,
    imageUrl
  );

  return NextResponse.json({ listing }, { status: 201 });
}
