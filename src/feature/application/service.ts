import {
  createNewFolder,
  getAllFoldersInFolder,
  getAuthenticatedDrive,
  getFileInFolderByName,
} from "@/lib/google/drive";
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
  const folders = await getAllFoldersInFolder(folderId);

  return folders;
}

type Metadata = {
  jobDescriptionUrl: string | null;
  jobTitle: string | null;
};

async function getMetaDataInFolder(folderId: string): Promise<Metadata> {
  const file = await getFileInFolderByName(folderId, "metadata");
  if (!file?.id) {
    console.error("Metadata file not found in folder: ", folderId);
    return {
      jobDescriptionUrl: null,
      jobTitle: null,
    };
  }

  const rows = await spreadsheetService.readTable<{
    link: string;
    title: string;
  }>(file.id, "overview");

  if (!rows.length || !rows) {
    console.error("Metadata table not found in file: ", file.id);
    return {
      jobDescriptionUrl: null,
      jobTitle: null,
    };
  }

  return {
    jobDescriptionUrl: (rows[0]?.get("link") as string) ?? null,
    jobTitle: (rows[0]?.get("title") as string) ?? null,
  };
}

const applicationService = {
  createNewApplication,
  copyTemplateDocument,
  getAllApplications,
  getMetaDataInFolder,
};

export default applicationService;
