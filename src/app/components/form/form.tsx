"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function Form({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"WATCH" | "JEWELRY">("WATCH");
  const [picture, setPicture] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!session?.user) {
      setError("You must be signed in to submit a listing.");
      return;
    }

    if (!brand.trim()) {
      setError("Brand is required.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("brand", brand.trim());
    formData.append("price", String(priceNum));
    formData.append("category", category);
    if (picture) formData.append("picture", picture);

    const res = await fetch("/api/listings", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setBrand("");
    setPrice("");
    setCategory("WATCH");
    setPicture(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto flex flex-col gap-6"
    >
      <h2 className="text-lg font-semibold text-foreground">Sell Your Item</h2>

      {session?.user && (
        <p className="text-sm text-secondary">
          Submitting as{" "}
          <span className="text-foreground">{session.user.name}</span> (
          {session.user.email})
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-secondary">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as "WATCH" | "JEWELRY")}
          className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        >
          <option value="WATCH">Watch</option>
          <option value="JEWELRY">Jewelry</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="brand" className="text-sm font-medium text-secondary">
          Brand
        </label>
        <input
          id="brand"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Rolex"
          required
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="price" className="text-sm font-medium text-secondary">
          Price ($)
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="picture" className="text-sm font-medium text-secondary">
          Upload Your Picture
        </label>
        <input
          id="picture"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setPicture(e.target.files?.[0] ?? null)}
          className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:bg-background file:text-foreground file:text-sm"
        />
      </div>

      {!session?.user && (
        <p className="text-sm text-amber-400">
          Please sign in to submit a listing.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !session?.user}
        className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
