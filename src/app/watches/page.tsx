import { prisma } from "@/lib/prisma";

export default async function WatchesPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED", category: "WATCH" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Watches</h1>
        <p className="text-secondary mb-10">
          Curated luxury timepieces available for purchase.
        </p>

        {listings.length === 0 ? (
          <p className="text-secondary">No watches available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.brand}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-background flex items-center justify-center">
                    <span className="text-secondary text-sm">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-foreground font-semibold text-lg">
                    {listing.brand}
                  </p>
                  <p className="text-gold font-medium mt-1">
                    ${listing.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
