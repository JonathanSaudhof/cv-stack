import { createNewFolder, getAuthenticatedDrive } from "@/lib/google";
import { auth } from "@/server/auth";

export const createNewApplication = async ({
  companyName,
  templateDocId,
  baseFolderId,
}: {
  companyName: string;
  templateDocId: string;
  baseFolderId: string | null;
}) => {
  try {
    const session = await auth();
    const folderId = await createNewFolder(companyName, baseFolderId);

    if (!folderId) {
      throw new Error("Failed to create folder");
    }

    const templateId = await copyTemplateDocument({
      templateDocId,
      folderId,
      documentName: `CV_${session.user?.name?.replace(" ", "_")}_${companyName}`,
    });

    if (!templateId) {
      throw new Error("Failed to copy template document");
    }

    return templateId;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function copyTemplateDocument({
  templateDocId,
  folderId,
  documentName,
}: {
  templateDocId: string;
  folderId: string;
  documentName: string;
}) {
  const drive = await getAuthenticatedDrive();

  const document = await drive.files.copy({
    fileId: templateDocId,
    requestBody: {
      parents: [folderId],
      name: documentName,
    },
  });

  return document.data.id;
}

export async function createStatusFile(folderId: string, status: string) {
  const drive = await getAuthenticatedDrive();

  const file = await drive.files.create({
    requestBody: {
      name: "status.json",
      mimeType: "application/json",
      parents: [folderId],
    },
    media: {
      mimeType: "application/json",
      body: JSON.stringify({ status }),
    },
  });

  return file.data.id;
}

export async function getAllApplications(folderId: string) {
  const drive = await getAuthenticatedDrive();

  const folders = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType)",
  });

  return folders.data.files?.filter(
    (file) => file.mimeType === "application/vnd.google-apps.folder",
  );
}
