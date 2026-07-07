"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 1000;
const MIN_BYTES = 100 * 1024;
const MAX_BYTES = 300 * 1024;

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.round((base64.length * 3) / 4) - padding;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Cover-crop to exactly 800x1000 so every listing photo is the same size.
        const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (TARGET_WIDTH - scaledWidth) / 2;
        const offsetY = (TARGET_HEIGHT - scaledHeight) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        canvas
          .getContext("2d")!
          .drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // Step the JPEG quality down until the encoded image lands in the 100-300KB range.
        let quality = 0.92;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrlByteSize(dataUrl) > MAX_BYTES && quality > 0.3) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrlByteSize(dataUrl) < MIN_BYTES && quality < 0.92) {
          quality = Math.min(0.92, quality + 0.08);
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function Form({ onSuccess }: { onSuccess?: () => void }) {
  const { data: session } = useSession();
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"WATCH" | "JEWELRY">("WATCH");
  const [picture, setPicture] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => onSuccess?.(), 4000);
    return () => clearTimeout(timer);
  }, [submitted, onSuccess]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    if (picture) {
      try {
        const compressed = await compressImage(picture);
        formData.append("imageUrl", compressed);
      } catch {
        setSubmitting(false);
        setError("Could not process the selected image. Please try another one.");
        return;
      }
    }

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

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 max-w-md mx-auto flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold">
          <svg
            className="w-7 h-7 text-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Item Submitted
        </h2>
        <p className="text-sm text-secondary leading-relaxed">
          Your item is now under review. You will receive a confirmation email
          once it has been approved.
        </p>
        <p className="text-xs text-secondary/60">This window will close shortly…</p>
      </div>
    );
  }

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
          step="1"
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
