"use client";

import { useState } from "react";
import Form from "../form/form";

export default function HeroSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="flex-1 flex items-center justify-center bg-card px-8 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Sell Your Luxury Items with Confidence
        </h1>
        <p className="mt-4 text-lg text-secondary">
          Turn your luxury watches and jewelry into cash. Submit your item
          for a professional valuation, and once approved, it will be
          listed for sale.
        </p>
        <button
          className="btn-accent mt-8"
          onClick={() => setIsFormOpen(true)}
        >
          Sell Your Item
        </button>
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setIsFormOpen(false)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFormOpen(false)}
              aria-label="Close form"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground"
            >
              &times;
            </button>
            <Form />
          </div>
        </div>
      )}
    </main>
  );
}
