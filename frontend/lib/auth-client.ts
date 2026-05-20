import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signUp, signIn, signOut, useSession } = client;
