"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

type Mode = "sign-in" | "register";

export default function Login({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    onSuccess?.();
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        lastName,
        email: registerEmail,
        password: registerPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setEmail(registerEmail);
    setPassword("");
    switchMode("sign-in");
    setMessage("Account created. Please sign in.");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-foreground text-center">
        {mode === "sign-in" ? "Sign In" : "Create Your Account"}
      </h2>

      {message && <p className="text-sm text-gold text-center">{message}</p>}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {mode === "sign-in" ? (
        <form onSubmit={handleSignIn} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-secondary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-accent disabled:opacity-60">
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-sm text-secondary text-center">
            New here?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="text-gold hover:underline"
            >
              Register here
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-secondary">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="lastName" className="text-sm font-medium text-secondary">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="registerEmail" className="text-sm font-medium text-secondary">
              Email Address
            </label>
            <input
              id="registerEmail"
              type="email"
              required
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="registerPassword" className="text-sm font-medium text-secondary">
              Password
            </label>
            <input
              id="registerPassword"
              type="password"
              required
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-gold"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-accent disabled:opacity-60">
            {isSubmitting ? "Creating Account..." : "Register"}
          </button>

          <p className="text-sm text-secondary text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("sign-in")}
              className="text-gold hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
