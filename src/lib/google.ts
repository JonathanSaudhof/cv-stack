"use server";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { google } from "googleapis";

async function getOAuth() {
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

export async function getAuthenticatedDocument() {
  return google.docs({ auth: await getOAuth(), version: "v1" });
}

export async function getAuthenticatedDrive() {
  return google.drive({ auth: await getOAuth(), version: "v3" });
}

export async function createNewFolder(
  folderName: string,
  parentFolderId: string | null,
) {
  const drive = await getAuthenticatedDrive();

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      parents: parentFolderId ? [parentFolderId] : [],
      mimeType: "application/vnd.google-apps.folder",
    },
  });

  return folder.data.id;
}

export async function createNewSheet(sheetName: string) {
  const drive = await getAuthenticatedDrive();

  const sheet = await drive.files.create({
    requestBody: {
      name: sheetName,
      mimeType: "application/vnd.google-apps.spreadsheet",
    },
  });

  return sheet.data.id;
}

export async function getAllFoldersInFolder(folderId: string) {
  const drive = await getAuthenticatedDrive();

  const folders = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType)",
  });

  return folders.data.files?.filter(
    (file) => file.mimeType === "application/vnd.google-apps.folder",
  );
}
