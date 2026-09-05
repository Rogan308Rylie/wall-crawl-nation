"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { buttons } from "@/lib/ui/buttons";

function LoginForm() {
  const { login, loginWithGoogle, logout, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isExpired = searchParams.get("expired") === "true";
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If session is expired and client still has user, clean it up immediately
  useEffect(() => {
    if (isExpired && user) {
      logout();
    }
  }, [isExpired, user, logout]);

  // If already logged in and NOT expired, redirect away from login page
  useEffect(() => {
    if (user && !authLoading && !isExpired) {
      router.push(redirectPath);
    }
  }, [user, authLoading, isExpired, redirectPath, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      router.push(redirectPath);
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 border-8 border-black bg-white p-8 shadow-[12px_12px_0_0_#A3FF12]">
      <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter text-black">
        Welcome Back
      </h1>

      {isExpired && (
        <div className="mb-6 border-4 border-black bg-yellow-300 p-4 font-black uppercase text-xs text-black shadow-[4px_4px_0_0_#000]">
          ⚠️ Your session has expired. Please log in again to continue.
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`${buttons.secondary} w-full mb-4`}
      >
        Continue with Google
      </button>

      <div className="text-center text-sm font-bold uppercase tracking-widest text-black mb-6">
        or continue with email
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />

        {error && <p className="text-red-600 font-bold text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`${buttons.primary} w-full`}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-20 p-8 font-black uppercase text-center text-black">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
