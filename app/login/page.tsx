"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { buttons } from "@/lib/ui/buttons";

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      router.push("/");
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
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function createSession() {
      if (!user) return;

      const idToken = await user.getIdToken();

      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      router.push("/");
    }

    createSession();
  }, [user, router]);

  return (
    <div className="max-w-md mx-auto mt-20 border border-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`${buttons.secondary} w-full mb-4`}
      >
        Continue with Google
      </button>

      <div className="text-center text-sm opacity-70 mb-4">
        or continue with email
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-white bg-transparent rounded"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-white bg-transparent rounded"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

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
