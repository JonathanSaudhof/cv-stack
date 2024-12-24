"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import clsx from "clsx";
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

type FileExplorerProps = {
  onSelect: (fileId: string) => void;
  initialSelectedFile?: string;
};

export default function FileExplorer({
  onSelect,
  initialSelectedFile,
}: FileExplorerProps) {
  const [folders, setFolders] = useState<drive_v3.Schema$File[]>([
    {
      id: "root",
      name: "Root",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(
    initialSelectedFile ?? null,
  );

  const { data, isLoading } = api.files.getFilesInFolder.useQuery({
    folderId: folders ? folders[folders.length - 1]!.id! : undefined,
  });

  const handleDocumentSelectClick = (
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
    setSelectedFile(fileId);
  };

  return (
    <Card>
      {isLoading ? <LoaderIcon className="animate-spin" /> : null}
      <CardHeader>
        <CardTitle>Choose a default Template</CardTitle>
        <CardDescription className="flex">
          {folders && !isLoading
            ? folders.map((folder, index) => (
                <Button
                  key={folder.id}
                  className="hover: flex gap-4 rounded p-2 hover:text-blue-600 hover:underline [&:not(:last-child)]:border-r"
                  onClick={() => {
                    setFolders((prev) => {
                      return prev ? prev.slice(0, index + 1) : [];
                    });
                  }}
                  variant="ghost"
                >
                  <p>{folder.name}</p>
                </Button>
              ))
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data
          ? data.map((file) => (
              <button
                key={file.id}
                className={clsx(
                  "flex gap-4 rounded border p-2",
                  selectedFile === file.id
                    ? "border-2 border-blue-600 bg-blue-300"
                    : "hover:bg-gray-100",
                )}
                onClick={() => {
                  handleDocumentSelectClick(
                    file.id!,
                    file.mimeType!,
                    file.name!,
                  );
                }}
              >
                {getIconFromMimeType({ mimeType: file.mimeType })}
                <p>{file.name}</p>
              </button>
            ))
          : null}
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button disabled={!selectedFile}>Save</Button>
        <Button
          disabled={!selectedFile}
          onClick={() => {
            setSelectedFile(null);
            setFolders([{ id: "root", name: "Root" }]);
          }}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}

function getIconFromMimeType({ mimeType }: { mimeType?: string | null }) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="stroke-gray-600" />;
  }

  if (mimeType === "application/vnd.google-apps.spreadsheet") {
    return <Sheet className="stroke-green-600" />;
  }

  if (mimeType === "application/vnd.google-apps.document") {
    return <FileText className="stroke-blue-600" />;
  }

  if (mimeType === "application/vnd.google-apps.presentation") {
    return <Presentation className="stroke-red-600" />;
  }

  if (mimeType === "application/vnd.google-apps.map") {
    return <Map className="stroke-gray-600" />;
  }

  return <File className="stroke-gray-600" />;
}
