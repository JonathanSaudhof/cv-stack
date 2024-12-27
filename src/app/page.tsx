import { Button } from "@/components/ui/button";
import { CreateApplication } from "@/feature/application/CreateApplication";
import { api, HydrateClient } from "@/trpc/server";
import FileExplorer from "../feature/file-explorer/FileExplorer";

export default async function Home() {
  const template = await api.config.getTemplateFile();
  const config = await api.config.getConfigFile();

  return (
    <HydrateClient>
      <main className="">
        <header className="flex justify-between border-b-2 px-8 py-4">
          <h1 className="text-2xl font-semibold">Application Manager</h1>
          <FileExplorer
            // onSaveClick={() => {
            //   "use server";
            //   return handleSaveClick(config);
            // }}
            defaultTemplateId={template?.documentId ?? null}
          />
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
        <section className="p-8">
          <h2 className="text-2xl font-semibold">Applications</h2>
          <ul>
            <li>Application 1</li>
            <li>Application 2</li>
            <li>Application 3</li>
          </ul>
        </section>
      </main>
    </HydrateClient>
  );
}
