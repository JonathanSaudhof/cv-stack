import { Button } from "@/components/ui/button";
import { api, HydrateClient } from "@/trpc/server";
import FileExplorer from "../feature/file-explorer/FileExplorer";
import CreateApplication from "@/feature/application/components/create-application";
import ApplicationsList, {
  ApplicationListSkeleton,
} from "@/feature/application/components/application-list";
import { FileInput } from "lucide-react";
import { Suspense } from "react";

export default async function Home() {
  const template = await api.config.getTemplateFile();
  const config = await api.config.getConfigFile();

  return (
    <HydrateClient>
      <main className="">
        <header className="flex justify-between border-b-2 px-8 py-4">
          <div className="flex gap-4">
            <FileInput />
            <h1 className="text-2xl font-semibold">Applify Moep</h1>
          </div>
          <FileExplorer defaultTemplateId={template?.documentId ?? null} />
        </header>
        <section className="flex justify-between border-b-2 p-8">
          {template ? (
            <Button variant="outline" asChild>
              <a
                href={`https://docs.google.com/document/d/${template?.documentId}`}
                target="_blank"
                rel="noreferrer"
              >
                {template.title}
              </a>
            </Button>
          ) : (
            "No template selected"
          )}

          <CreateApplication />
        </section>

        {config?.folderId ? (
          <Suspense fallback={<ApplicationListSkeleton />} key={Math.random()}>
            <ApplicationsList folderId={config.folderId} />
          </Suspense>
        ) : (
          <div>No folderId found</div>
        )}
      </main>
    </HydrateClient>
  );
}
