"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Listing = {
  id: string;
  brand: string;
  price: number;
  category: "WATCH" | "JEWELRY";
  status: "PENDING" | "APPROVED" | "REJECTED";
  imageUrl: string | null;
  createdAt: string;
};

const statusStyles: Record<Listing["status"], string> = {
  PENDING: "text-amber-400 bg-amber-900/20 border-amber-700",
  APPROVED: "text-green-400 bg-green-900/20 border-green-700",
  REJECTED: "text-red-400 bg-red-900/20 border-red-700",
};

const statusLabel: Record<Listing["status"], string> = {
  PENDING: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data) => setListings(data.listings ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  if (status === "loading" || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-secondary">Loading…</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-secondary">Please sign in to view your listings.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">My Listings</h1>
        <p className="text-secondary mb-8">Items you have submitted for review.</p>

        {listings.length === 0 ? (
          <p className="text-secondary">You have not submitted any items yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card border border-border rounded-lg p-5 flex gap-5 items-center"
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.brand}
                    className="w-20 h-20 object-cover rounded-md border border-border shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-md border border-border bg-background flex items-center justify-center shrink-0">
                    <span className="text-secondary text-xs">No image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-semibold">{listing.brand}</span>
                    <span className="text-xs text-secondary bg-background border border-border rounded-full px-2 py-0.5">
                      {listing.category === "WATCH" ? "Watch" : "Jewelry"}
                    </span>
                  </div>
                  <p className="text-gold font-medium">${listing.price.toLocaleString()}</p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs border rounded-full px-3 py-1 ${statusStyles[listing.status]}`}>
                    {statusLabel[listing.status]}
                  </span>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleting === listing.id}
                    className="px-3 py-1 text-sm rounded-full border border-border text-secondary hover:text-red-400 hover:border-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting === listing.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
