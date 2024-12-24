"use server";

import { env } from "@/env";
import { auth } from "@/server/auth";
import { google } from "googleapis";

async function getAuthenticatedDrive() {
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

  return google.drive({ auth: oauth, version: "v3" });
}

export async function getAllFilesInFolder(folderId?: string) {
  const drive = await getAuthenticatedDrive();

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

export async function downloadFile(fileId: string) {
  const drive = await getAuthenticatedDrive();

  try {
    const res = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" },
    );

    return res.data;
  } catch (error) {
    throw error;
  }
}

type Config = {
  folderId: string;
  defaultTemplateDocId: string;
};

const CONFIG_FILE_NAME = "config.json";

export async function getConfigFile() {
  const drive = await getAuthenticatedDrive();

  try {
    const config = await drive.files.list({
      q: `name = '${CONFIG_FILE_NAME}'`,
      fields: "nextPageToken, files(id, name)",
      spaces: "appDataFolder",
    });

    return config.data.files ? config.data.files[0] : null;
  } catch (error) {
    console.error(error);
  }
}

export async function createConfigFile() {
  const drive = await getAuthenticatedDrive();

  try {
    const res = await drive.files.create({
      requestBody: {
        name: CONFIG_FILE_NAME,
        mimeType: "application/json",
        parents: ["appDataFolder"],
      },
      media: {
        mimeType: "application/json",
        body: JSON.stringify({
          folderId: "root",
          defaultTemplateDocId: "",
        }),
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getFileById(fileId: string) {
  const drive = await getAuthenticatedDrive();

  try {
    return await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });
  } catch (error) {
    console.error(error);
  }
}
