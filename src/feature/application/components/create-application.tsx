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

export default function CreateApplication() {
  const [companyName, setCompanyName] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState<string>("");
  const router = useRouter();
  const { mutate } = api.applications.createApplication.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "companyName":
        setCompanyName(e.target.value);
        break;
      case "jobTitle":
        setJobTitle(e.target.value);
        break;
      case "jobDescriptionUrl":
        setJobDescriptionUrl(e.target.value);
        break;
    }
  };

  const handleSaveClick = () => {
    setCompanyName("");
    mutate(
      { companyName, jobTitle, jobDescriptionUrl },
      {
        onSuccess: () => {
          router.refresh();
        },
        onError: (error) => {
          console.error(error);
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
          name="companyName"
          onChange={handleInputChange}
        />
        <Input
          type="text"
          placeholder="Job Title"
          name="jobTitle"
          onChange={handleInputChange}
        />
        <Input
          type="text"
          placeholder="Job Description URL"
          name="jobDescriptionUrl"
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
