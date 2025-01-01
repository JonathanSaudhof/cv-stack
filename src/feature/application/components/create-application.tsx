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
import { CreateApplicationSchema, type CreateApplication } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function CreateApplicationForm() {
  const form = useForm<CreateApplication>({
    resolver: zodResolver(CreateApplicationSchema),
  });
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

  const handleSaveClick = (data: CreateApplication) => {
    console.log(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Application</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSaveClick)}
            className="flex flex-col space-y-4"
            id="create-application-form"
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Software Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescriptionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.apple.com/jobs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <DialogFooter>
            <Button type="submit" form="create-application-form">
              Save
            </Button>
            <Button variant="secondary">Cancel</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
