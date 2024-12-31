import { Button } from "@/components/ui/button";
import { api } from "@/trpc/server";
import { Archive, File, SquareArrowOutUpRight } from "lucide-react";

export default async function ApplicationsList({
  folderId,
}: Readonly<{
  folderId: string;
}>) {
  const applications = await api.applications.getAllApplications({ folderId });

  return (
    <section className="flex flex-col gap-4 p-8">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <ul className="flex flex-col gap-2">
        {applications.map((application) => (
          <li
            key={application.id}
            className="flex items-center gap-4 rounded border p-4"
          >
            <div className="flex flex-1 gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-300">Company</p>
                <p>{application.name}</p>
              </div>
              <div className="flex w-24 flex-col gap-1">
                <p className="text-xs text-gray-300">Job Title</p>
                <p>Job Title</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-300">Status</p>
                <p>Interview</p>
              </div>
            </div>
            <div>
              <Button variant="ghost" asChild title="Document's Folder">
                <a
                  href={`https://drive.google.com/drive/u/1/folders/${application.id}`}
                  target="_blank"
                >
                  <SquareArrowOutUpRight />
                </a>
              </Button>
              <Button variant="ghost">
                <File />
                <span className="sr-only">CV</span>
              </Button>
              <Button variant="ghost">
                <Archive />
                <span className="sr-only">Archive</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
