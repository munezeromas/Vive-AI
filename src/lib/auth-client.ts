import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // You can specify the base URL if needed, but it usually infers it
});

export const { signIn, signUp, signOut, useSession } = authClient;
