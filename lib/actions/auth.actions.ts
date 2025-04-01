/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, db } from "@/firebase/admin";

import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7;

export const setSessionCookie = async (idToken: string) => {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
};

export const signUp = async (params: SignUpParams) => {
  const { email, name, uid } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return { success: true, message: "User already exists. Please sign in." };
    }

    await db.collection("users").doc(uid).set({
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (e: any) {
    console.error("Error creating user: ", e);

    if (e.code === "auth/email-already-exists") {
      return { success: false, message: "This email is already in use." };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again",
    };
  }
};

export const signIn = async (params: SignInParams) => {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };
    }

    await setSessionCookie(idToken);
  } catch (e: any) {
    console.error("Error during the log in session: ", e);

    return {
      success: false,
      message: "Failed to log into account. Please try again",
    };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return { ...userRecord.data(), id: userRecord.id } as User;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};
