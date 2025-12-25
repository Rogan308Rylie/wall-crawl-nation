"use client";

import { createContext, useContext, useEffect, useState, } from "react";

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

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  async function saveUserProfile(user: any) {
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
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name,});
  await saveUserProfile({ ...result.user, displayName: name });
}

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await signInWithEmailAndPassword(auth, email, password);
    await saveUserProfile(result.user);
  }

  async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await signInWithPopup(auth, provider);
  await saveUserProfile(result.user);
}

  async function logout() {
    await signOut(auth);
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
