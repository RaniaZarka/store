"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Listing = {
  id: string;
  brand: string;
  price: number;
  category: "WATCH" | "JEWELRY";
  imageUrl: string | null;
  createdAt: string;
  user: {
    name: string | null;
    lastName: string | null;
    email: string | null;
  };
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/listings")
      .then((r) => r.json())
      .then((data) => setListings(data.listings ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    setActing(id);
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: decision }),
    });
    setActing(null);
    if (decision === "APPROVED") {
      router.push("/");
    } else {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-secondary">Loading…</p>
      </main>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-secondary">Access denied.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">
          Pending Reviews
        </h1>

        {listings.length === 0 ? (
          <p className="text-secondary">No listings awaiting review.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card border border-border rounded-lg p-6 flex gap-6 items-start"
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.brand}
                    className="w-32 h-32 object-cover rounded-md border border-border shrink-0"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-md border border-border bg-background flex items-center justify-center shrink-0">
                    <span className="text-secondary text-xs">No image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-foreground font-semibold text-lg">
                      {listing.brand}
                    </span>
                    <span className="text-xs text-secondary bg-background border border-border rounded-full px-2 py-0.5">
                      {listing.category === "WATCH" ? "Watch" : "Jewelry"}
                    </span>
                  </div>
                  <p className="text-gold font-medium mb-2">
                    ${listing.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-secondary">
                    {listing.user.name} {listing.user.lastName} &mdash;{" "}
                    {listing.user.email}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => decide(listing.id, "APPROVED")}
                    disabled={acting === listing.id}
                    className="btn-accent px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(listing.id, "REJECTED")}
                    disabled={acting === listing.id}
                    className="px-4 py-2 text-sm rounded-full border border-border text-secondary hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Reject
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
