"use server";

import { env } from "@/env";
import { auth } from "@/server/auth";
import { google } from "googleapis";

async function getGoogleOauth() {
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

export async function getAllFilesInFolder(folderId?: string) {
  const oauth = await getGoogleOauth();
  const drive = google.drive({ auth: oauth, version: "v3" });

  try {
    const res = await drive.files.list({
      q: `'${folderId ? folderId : "root"}' in parents`,
      fields: "nextPageToken,files(id, name, mimeType)",
      orderBy: "folder",
    });

    return res.data.files;
  } catch (error) {
    throw error;
  }
}
