import { prisma } from "@/lib/prisma";
import ListingGrid from "@/app/components/listings/ListingGrid";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const query = brand?.trim() ?? "";

  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      ...(query && {
        brand: { contains: query, mode: "insensitive" },
      }),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, brand: true, price: true, imageUrl: true },
  });

  return (
    <main className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {query ? `Results for "${query}"` : "All Items"}
        </h1>
        <p className="text-secondary mb-10">
          {listings.length} item{listings.length !== 1 ? "s" : ""} found
        </p>
        <ListingGrid listings={listings} showBrandFilter={false} />
      </div>
    </main>
  );
}
