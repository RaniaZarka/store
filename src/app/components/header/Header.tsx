"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Login from "../login/Login";

export default function Header() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        <Link href="/" className="text-2xl font-bold tracking-wide shrink-0">
          My Store
        </Link>

        <nav className="flex items-center gap-16 text-lg font-medium">
          <Link href="/jewelry" className="nav-link">
            Jewelry
          </Link>
          <Link href="/watches" className="nav-link">
            Watches
          </Link>
        </nav>

        <div className="flex items-center gap-6 shrink-0">
          <div className="search-bar">
            <svg
              className="w-4 h-4 text-secondary shrink-0"
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
              className="search-input"
            />
          </div>

          {session?.user ? (
            <div className="flex items-center gap-4 whitespace-nowrap">
              <span className="text-sm text-secondary">
                Welcome, {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="btn-accent px-4 py-2 text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="btn-accent px-4 py-2 text-sm whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setIsLoginOpen(false)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsLoginOpen(false)}
              aria-label="Close login"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground"
            >
              &times;
            </button>
            <Login onSuccess={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
