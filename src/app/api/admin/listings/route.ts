import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const listings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, lastName: true, email: true },
      },
    },
  });

  return NextResponse.json({ listings });
}
