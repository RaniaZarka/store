"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/"), 3000);
  };

  if (done) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 max-w-md w-full text-center flex flex-col gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold mx-auto">
          <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Password updated!</h2>
        <p className="text-sm text-secondary">Redirecting you to the home page…</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-foreground text-center">
        Choose a new password
      </h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2 text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-secondary">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-sm font-medium text-secondary">
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-accent disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Reset Password"}
        </button>
      </form>

      <p className="text-sm text-secondary text-center">
        <Link href="/" className="text-gold hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-secondary">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
