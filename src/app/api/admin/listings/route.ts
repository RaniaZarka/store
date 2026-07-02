import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  const listings = await prisma.listing.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, lastName: true, email: true },
      },
    },
  });

  return NextResponse.json({ listings });
}
