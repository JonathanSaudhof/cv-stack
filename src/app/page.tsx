import {
  createConfigFile,
  getConfigFile,
} from "@/feature/file-explorer/services";
import { HydrateClient } from "@/trpc/server";
import FileExplorer from "../feature/file-explorer/FileExplorer";

export default async function Home() {
  const config = await getConfigFile();

  if (!config) {
    await createConfigFile();
  }

  return (
    <HydrateClient>
      <main className="px-8 py-4">
        <FileExplorer />
      </main>
    </HydrateClient>
  );
}
