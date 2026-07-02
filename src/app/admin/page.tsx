

"use client";

import { useEffect, useState, useCallback } from "react";
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

type Tab = "PENDING" | "APPROVED";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("PENDING");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; reason: string } | null>(null);
  const [actionError, setActionError] = useState("");

  const fetchListings = useCallback(async (t: Tab) => {
    setLoading(true);
    setActionError("");
    const res = await fetch(`/api/admin/listings?status=${t}`);
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchListings(tab);
  }, [status, tab, fetchListings]);

  const approve = async (id: string) => {
    setActing(id);
    setActionError("");
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    setActing(null);
    if (!res.ok) { setActionError("Failed to approve. Please try again."); return; }
    router.push("/");
  };

  const reject = async () => {
    if (!rejectTarget) return;
    setActing(rejectTarget.id);
    setActionError("");
    const res = await fetch(`/api/admin/listings/${rejectTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED", reason: rejectTarget.reason }),
    });
    setActing(null);
    if (!res.ok) { setActionError("Failed to reject. Please try again."); return; }
    setListings((prev) => prev.filter((l) => l.id !== rejectTarget.id));
    setRejectTarget(null);
  };

  const deleteListing = async (id: string) => {
    setActing(id);
    setActionError("");
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setActing(null);
    if (!res.ok) { setActionError("Failed to delete. Please try again."); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  if (status === "loading") {
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Admin Panel</h1>

        <div className="flex gap-1 border-b border-border mb-8">
          {(["PENDING", "APPROVED"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setRejectTarget(null); }}
              className={`px-5 py-2 text-sm font-medium rounded-t-md transition-colors ${tab === t
                  ? "bg-card border border-b-0 border-border text-foreground"
                  : "text-secondary hover:text-foreground"
                }`}
            >
              {t === "PENDING" ? "Pending Reviews" : "Approved Items"}
            </button>
          ))}
        </div>

        {actionError && (
          <p className="mb-6 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-4 py-3">
            {actionError}
          </p>
        )}

        {loading ? (
          <p className="text-secondary">Loading…</p>
        ) : listings.length === 0 ? (
          <p className="text-secondary">
            {tab === "PENDING" ? "No listings awaiting review." : "No approved listings."}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
                <div className="flex gap-6 items-start">
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
                      <span className="text-foreground font-semibold text-lg">{listing.brand}</span>
                      <span className="text-xs text-secondary bg-background border border-border rounded-full px-2 py-0.5">
                        {listing.category === "WATCH" ? "Watch" : "Jewelry"}
                      </span>
                    </div>
                    <p className="text-gold font-medium mb-2">${listing.price.toLocaleString()}</p>
                    <p className="text-sm text-secondary">
                      {listing.user.name} {listing.user.lastName} &mdash; {listing.user.email}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {tab === "PENDING" ? (
                      <>
                        <button
                          onClick={() => approve(listing.id)}
                          disabled={acting === listing.id}
                          className="btn-accent px-4 py-2 text-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectTarget(
                              rejectTarget?.id === listing.id ? null : { id: listing.id, reason: "" }
                            )
                          }
                          disabled={acting === listing.id}
                          className="px-4 py-2 text-sm rounded-full border border-border text-secondary hover:text-red-400 hover:border-red-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={acting === listing.id}
                        className="px-4 py-2 text-sm rounded-full border border-red-800 text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        {acting === listing.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>

                {rejectTarget?.id === listing.id && (
                  <div className="border-t border-border pt-4 flex flex-col gap-3">
                    <label className="text-sm font-medium text-secondary">
                      Reason for rejection{" "}
                      <span className="text-secondary/50 font-normal">(optional — included in the email)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectTarget.reason}
                      onChange={(e) => setRejectTarget({ ...rejectTarget, reason: e.target.value })}
                      placeholder="e.g. The item does not meet our quality standards."
                      className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={reject}
                        disabled={acting === listing.id}
                        className="px-4 py-2 text-sm rounded-full bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
                      >
                        {acting === listing.id ? "Rejecting…" : "Confirm Rejection"}
                      </button>
                      <button
                        onClick={() => setRejectTarget(null)}
                        className="px-4 py-2 text-sm rounded-full border border-border text-secondary hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
