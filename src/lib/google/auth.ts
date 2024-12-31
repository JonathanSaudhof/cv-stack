"use server";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { google } from "googleapis";

export async function getOAuth() {
  const session = await auth();
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const accessToken = session?.access_token;
  const refreshToken = session?.refresh_token;

  const oauth = new google.auth.OAuth2({
    clientId,
    clientSecret,
  });

  oauth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth;
}
