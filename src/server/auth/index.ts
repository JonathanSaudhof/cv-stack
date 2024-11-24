import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";
import { redirect } from "next/navigation";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = async () => {
  const session = await cache(uncachedAuth)();
  console.log({ session });
  if (!session) {
    redirect("/api/auth/signin");
  }

  return session;
};

export { auth, handlers, signIn, signOut };
