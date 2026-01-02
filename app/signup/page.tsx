"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, name);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
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
    if (user) {
      router.push("/");
    }
  }, [user, router]);


  return (
    <div className="max-w-md mx-auto mt-20 border border-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Account
      </h1>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full mb-4 py-3 border border-white rounded flex items-center justify-center gap-3 hover:bg-white hover:text-black transition disabled:opacity-50"
        >
        <span className="font-semibold">Continue with Google</span>
      </button>

<div className="text-center text-sm opacity-70 mb-4">
  or continue with email
</div>


      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-white bg-transparent rounded"
        />  


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

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black font-semibold rounded hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
