"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateApplication() {
  const [companyName, setCompanyName] = useState<string>("");
  const router = useRouter();
  const { mutate, error, isPending } =
    api.applications.createApplication.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleSaveClick = () => {
    setCompanyName("");
    mutate(
      { companyName },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Company Name"
          onChange={handleInputChange}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSaveClick}>Save</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
