import { prisma } from "@/lib/prisma";
import ListingGrid from "@/app/components/listings/ListingGrid";

export const dynamic = "force-dynamic";

export default async function WatchesPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED", category: "WATCH" },
    orderBy: { createdAt: "desc" },
    select: { id: true, brand: true, price: true, imageUrl: true },
  });

  return (
    <main className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Watches</h1>
        <p className="text-secondary mb-10">
          Curated luxury timepieces available for purchase.
        </p>
        <ListingGrid listings={listings} />
      </div>
    </main>
  );
}
