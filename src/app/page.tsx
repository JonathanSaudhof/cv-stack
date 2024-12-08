import { HydrateClient } from "@/trpc/server";
import FileExplorer from "./_components/FileExplorer";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="px-8 py-4">
        <FileExplorer />
      </main>
    </HydrateClient>
  );
}
