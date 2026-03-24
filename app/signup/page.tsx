"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { buttons } from "@/lib/ui/buttons";

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
}
 finally {
    setLoading(false);
  }
}

useEffect(() => {
  if (user) {
    router.push("/");
  }
}, [user, router]);


  return (
    <div className="max-w-md mx-auto mt-20 border-8 border-black bg-white p-8 shadow-[12px_12px_0_0_#A3FF12]">
      <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter text-black">
        Create Account
      </h1>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className={`${buttons.secondary} w-full mb-4 flex items-center justify-center gap-3`}
        >
        <span className="font-semibold">Continue with Google</span>
      </button>

<div className="text-center text-sm font-bold uppercase tracking-widest text-black mb-6">
  or continue with email
</div>


      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 border-4 border-black bg-[#f0f0f0] text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
        />  


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

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${buttons.primary} w-full`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
