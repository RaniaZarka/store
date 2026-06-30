"use client";

import { useState, type SubmitEvent } from "react";

export default function Form() {
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [picture, setPicture] = useState<File | null>(null);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    console.log({ brand, price, picture });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto flex flex-col gap-6"
    >
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
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="price" className="text-sm font-medium text-secondary">
          Price
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="picture" className="text-sm font-medium text-secondary">
          Upload Your Picture
        </label>
        <input
          id="picture"
          type="file"
          accept="image/*"
          onChange={(e) => setPicture(e.target.files?.[0] ?? null)}
          className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border file:bg-background file:text-foreground file:text-sm"
        />
      </div>

      <button type="submit" className="btn-accent">
        Submit
      </button>
    </form>
  );
}
