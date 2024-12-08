"use client";
import { api } from "@/trpc/react";
import { type drive_v3 } from "googleapis";
import {
  File,
  FileText,
  Folder,
  LoaderIcon,
  Map,
  Presentation,
  Sheet,
} from "lucide-react";
import { useState } from "react";

export default function FileExplorer() {
  const [folders, setFolders] = useState<drive_v3.Schema$File[]>([
    {
      id: "root",
      name: "Root",
    },
  ]);

  const { data, isLoading } = api.files.getFilesInFolder.useQuery({
    folderId: folders ? folders[folders.length - 1]!.id! : undefined,
  });

  const handleButtonClick = (
    fileId: string,
    mimeType: string,
    name: string,
  ) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      setFolders((prev) => {
        return prev ? [...prev, { id: fileId, name }] : [{ id: fileId, name }];
      });
      return;
    }
  };

  return (
    <div className="container flex flex-col gap-2 rounded-lg border p-8">
      {isLoading ? <LoaderIcon className="animate-spin" /> : null}
      <div className="flex">
        {folders && !isLoading
          ? folders.map((folder, index) => (
              <button
                key={folder.id}
                className="hover: flex gap-4 rounded p-2 hover:text-blue-600 hover:underline [&:not(:last-child)]:border-r"
                onClick={() => {
                  setFolders((prev) => {
                    return prev ? prev.slice(0, index + 1) : [];
                  });
                }}
              >
                <p>{folder.name}</p>
              </button>
            ))
          : null}
      </div>
      {data
        ? data.map((file) => (
            <button
              key={file.id}
              className="flex gap-4 rounded border p-2"
              onClick={() => {
                handleButtonClick(file.id!, file.mimeType!, file.name!);
              }}
            >
              {getIconFromMimeType({ mimeType: file.mimeType })}
              <p>{file.name}</p>
            </button>
          ))
        : null}
    </div>
  );
}

function getIconFromMimeType({ mimeType }: { mimeType?: string | null }) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="stroke-gray-600" />;
  }

  if (mimeType === "application/vnd.google-apps.spreadsheet")
    return <Sheet className="stroke-green-600" />;

  if (mimeType === "application/vnd.google-apps.document")
    return <FileText className="stroke-blue-600" />;

  if (mimeType === "application/vnd.google-apps.presentation")
    return <Presentation className="stroke-red-600" />;

  if (mimeType === "application/vnd.google-apps.map")
    return <Map className="stroke-gray-600" />;

  return <File className="stroke-gray-600" />;
}
