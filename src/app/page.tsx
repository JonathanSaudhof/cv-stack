import {
  createConfigFile,
  getConfigFile,
  updateConfigFile,
} from "@/feature/file-explorer/services";
import { HydrateClient } from "@/trpc/server";
import FileExplorer from "../feature/file-explorer/FileExplorer";
import { revalidatePath } from "next/cache";

export default async function Home() {
  let config = await getConfigFile();
  console.log("config", config);

  if (!config) {
    await createConfigFile();
    config = await getConfigFile();
  }

  const handleSaveClick = async (templateFileId: string) => {
    "use server";
    console.log("Save clicked", templateFileId);
    if (!config) {
      console.error("Config file not found");
      return;
    }
    await updateConfigFile({ ...config, defaultTemplateDocId: templateFileId });
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
