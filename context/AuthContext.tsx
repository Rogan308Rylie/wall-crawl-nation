"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User,} from "firebase/auth";

import { GoogleAuthProvider, signInWithPopup,} from "firebase/auth";

import { updateProfile } from "firebase/auth";

import app from "@/lib/firebase";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";


type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};



const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticating = useRef(false);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isAuthenticating.current) {
        setUser(firebaseUser);
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        try {
          const res = await fetch("/api/auth/session");
          const data = await res.json();

          if (data.expired || !data.user) {
            console.warn("Session expired on server. Logging out user...");
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Session verification error:", err);
        }
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Periodic & focus check to detect expired session while user has tab open
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      if (isAuthenticating.current) return;
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.expired || !data.user) {
          console.warn("Session expired during active session. Logging out...");
          await signOut(auth);
          setUser(null);
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href =
              "/login?expired=true&redirect=" +
              encodeURIComponent(window.location.pathname);
          }
        }
      } catch (err) {
        console.error("Periodic session check error:", err);
      }
    };

    window.addEventListener("focus", checkSession);
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, [user, auth]);

  async function saveUserProfile(user: any) {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    await setDoc(
      userRef,
      {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        provider: user.providerData[0]?.providerId || "password",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function signup(email: string, password: string, name: string) {
    isAuthenticating.current = true;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, { displayName: name });
      await saveUserProfile({ ...result.user, displayName: name });

      // 🔐 CREATE SESSION COOKIE
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session on server");
      }

      setUser(result.user);
    } finally {
      isAuthenticating.current = false;
    }
  }

  async function login(email: string, password: string) {
    isAuthenticating.current = true;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserProfile(result.user);

      // 🔐 CREATE SESSION COOKIE
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session on server");
      }

      setUser(result.user);
    } finally {
      isAuthenticating.current = false;
    }
  }

  async function loginWithGoogle() {
    isAuthenticating.current = true;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserProfile(result.user);

      // 🔐 CREATE SESSION COOKIE
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session on server");
      }

      setUser(result.user);
    } finally {
      isAuthenticating.current = false;
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete server session on logout:", err);
    }
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
