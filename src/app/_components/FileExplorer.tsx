"use client";
import { api } from "@/trpc/react";
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
  const [folderId, setFolderId] = useState<string>();

  const { data, isLoading } = api.files.getFilesInFolder.useQuery({
    folderId: folderId,
  });

  const handleButtonClick = (fileId: string, mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      setFolderId(fileId);
      return;
    }
  };

  return (
    <div className="container flex flex-col gap-2 rounded-lg border p-8">
      {isLoading ? <LoaderIcon className="animate-spin" /> : null}
      {data
        ? data.map((file) => (
            <button
              key={file.id}
              className="flex gap-4 rounded border p-2"
              onClick={() => {
                handleButtonClick(file.id!, file.mimeType!);
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
