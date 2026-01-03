import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { env } from "./env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
