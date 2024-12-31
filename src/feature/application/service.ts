import { createNewFolder, getAuthenticatedDrive } from "@/lib/google/drive";
import { auth } from "@/server/auth";
import {
  ApplicationSchema,
  type CreateApplication,
  type Application,
} from "./schema";
import spreadsheetService from "@/lib/google/spreadsheet";

const createNewApplication = async ({
  data,
  templateDocId,
  baseFolderId,
}: {
  data: CreateApplication;
  templateDocId: string;
  baseFolderId: string | null;
}): Promise<Application | null> => {
  try {
    const session = await auth();
    const folderId = await createNewFolder(data.companyName, baseFolderId);

    if (!folderId) {
      throw new Error("Failed to create folder");
    }

    const templateId = await copyTemplateDocument({
      templateDocId,
      folderId,
      documentName: `CV_${session.user?.name?.replace(" ", "_")}_${new Date().toISOString()}`,
    });

    if (!templateId) {
      throw new Error("Failed to copy template document");
    }

    await createMetadataSheet({
      folderId,
      jobTitle: data.jobTitle,
      jobDescriptionUrl: data.jobDescriptionUrl,
    });

    return ApplicationSchema.parse({
      ...data,
      folderId,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

async function copyTemplateDocument({
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

////////////// Metadata Sheet //////////////
async function createMetadataSheet({
  folderId,
  jobTitle,
  jobDescriptionUrl,
}: {
  folderId: string;
  jobTitle: string;
  jobDescriptionUrl: string;
}) {
  const sheetName = "metadata";
  const spreadsheetId = await spreadsheetService.createSpreadSheet(
    sheetName,
    folderId,
  );

  if (!spreadsheetId) {
    throw new Error("Failed to create metadata sheet");
  }

  await createOverviewTable(spreadsheetId, { jobTitle, jobDescriptionUrl });
}

async function createOverviewTable(
  spreadSheetId: string,
  data: { jobDescriptionUrl: string; jobTitle: string },
) {
  const OVERVIEW_SHEET_NAME = "overview";
  const columns = ["link", "title"];

  const table = await spreadsheetService.createTable({
    spreadSheetId,
    title: OVERVIEW_SHEET_NAME,
    columns,
  });

  if (!table) {
    throw new Error("Failed to create overview table");
  }

  await table.addRows([
    {
      link: data.jobDescriptionUrl,
      title: data.jobTitle,
    },
  ]);
}

async function getAllApplications(folderId: string) {
  const drive = await getAuthenticatedDrive();

  const folders = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType)",
  });

  return folders.data.files?.filter(
    (file) => file.mimeType === "application/vnd.google-apps.folder",
  );
}

const applicationService = {
  createNewApplication,
  copyTemplateDocument,
  getAllApplications,
};

export default applicationService;
