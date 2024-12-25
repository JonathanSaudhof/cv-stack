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
  id: string;
  folderId: string;
  defaultTemplateDocId: string;
};

const CONFIG_FILE_NAME = "config.json";

export async function getConfigFile() {
  const drive = await getAuthenticatedDrive();

  try {
    const fileList = await drive.files.list({
      q: `name = '${CONFIG_FILE_NAME}'`,
      fields: "nextPageToken, files(id, name)",
      spaces: "appDataFolder",
    });
    // return actual content of the file
    const configFile = fileList.data.files ? fileList.data.files[0] : null;
    if (!configFile?.id) {
      return null;
    }
    const config = await getFileById(configFile?.id);
    return { id: configFile.id, ...config } as Config;
  } catch (error) {
    console.error(error);
    return null;
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
    const fileContent = await drive.files.get({
      fileId: fileId,
      alt: "media",
    });

    return fileContent.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateConfigFile(config: Config) {
  const drive = await getAuthenticatedDrive();

  const configFile = await getConfigFile();

  if (!configFile) {
    console.error("Config file not found");
    return null;
  }

  if (!configFile.id) {
    console.error("Config file id not found");
    return null;
  }

  try {
    await drive.files.update({
      fileId: configFile.id,
      media: {
        mimeType: "application/json",
        body: JSON.stringify(config),
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
