"use client";

import { useState, useMemo } from "react";

type Listing = {
  id: string;
  brand: string;
  price: number;
  imageUrl: string | null;
};

export default function ListingGrid({
  listings,
  showBrandFilter = true,
}: {
  listings: Listing[];
  showBrandFilter?: boolean;
}) {
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (showBrandFilter && brand && !l.brand.toLowerCase().includes(brand.toLowerCase())) {
        return false;
      }
      if (minPrice !== "" && l.price < parseFloat(minPrice)) return false;
      if (maxPrice !== "" && l.price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [listings, brand, minPrice, maxPrice, showBrandFilter]);

  const hasFilters = (showBrandFilter && brand) || minPrice || maxPrice;

  const clear = () => {
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {showBrandFilter && (
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Search by brand…"
            className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold placeholder-secondary w-48"
          />
        )}
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          min="0"
          className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold placeholder-secondary w-32"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          min="0"
          className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold placeholder-secondary w-32"
        />
        {hasFilters && (
          <button
            onClick={clear}
            className="px-4 py-2 text-sm rounded-md border border-border text-secondary hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-sm text-secondary mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-secondary">No items match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
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
  );
}
