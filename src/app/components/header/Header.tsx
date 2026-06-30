"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="bg-gray-900 text-white px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        <Link href="/" className="text-2xl font-bold tracking-wide shrink-0">
          My Store
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/jewelry"
            className="hover:text-yellow-400 transition-colors"
          >
            Jewelry
          </Link>
          <Link
            href="/watches"
            className="hover:text-yellow-400 transition-colors"
          >
            Watches
          </Link>
        </nav>

        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 gap-2 w-64">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-full"
          />
        </div>
      </div>
    </header>
  );
}
