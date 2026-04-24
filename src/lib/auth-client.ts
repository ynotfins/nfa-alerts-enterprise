"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: result.user }, error: null };
    },
    social: async ({ provider }: { provider: "google" }) => {
      if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        return { data: { user: result.user }, error: null };
      }
      throw new Error("Unsupported provider");
    },
  },
  signUp: {
    email: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
      name?: string;
    }) => {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { data: { user: result.user }, error: null };
    },
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    return { error: null };
  },
  forgetPassword: async ({ email }: { email: string }) => {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  },
  sendVerificationEmail: async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
    return { error: null };
  },
  getSession: () => {
    return auth.currentUser;
  },
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

export type AuthClient = typeof authClient;
