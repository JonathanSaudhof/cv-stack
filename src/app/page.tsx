import {
  createConfigFile,
  getConfigFile,
  updateConfigFile,
} from "@/feature/file-explorer/services";
import { HydrateClient } from "@/trpc/server";
import { revalidatePath } from "next/cache";
import FileExplorer from "../feature/file-explorer/FileExplorer";

export default async function Home() {
  let config = await getConfigFile();

  if (!config) {
    await createConfigFile();
    config = await getConfigFile();
  }

  const handleSaveClick = async ({
    folderId,
    templateFileId,
  }: {
    folderId: string | null;
    templateFileId: string;
  }) => {
    "use server";
    if (!config) {
      console.error("Config file not found");
      return;
    }
    await updateConfigFile({
      ...config,
      folderId,
      defaultTemplateDocId: templateFileId,
    });
    revalidatePath("/");
  };

  return (
    <HydrateClient>
      <main className="px-8 py-4">
        <FileExplorer
          onSaveClick={handleSaveClick}
          defaultTemplateId={config?.defaultTemplateDocId}
        />
      </main>
    </HydrateClient>
  );
}
