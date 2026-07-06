import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getListingsByStatus } from "@/services/adminService";
import type { ListingStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") ?? "PENDING";
  const validStatuses: ListingStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  const status = validStatuses.includes(statusParam as ListingStatus)
    ? (statusParam as ListingStatus)
    : "PENDING";

  const listings = await getListingsByStatus(status);
  return NextResponse.json({ listings });
}
