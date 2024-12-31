import { z } from "zod";

export const CreateApplicationSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  jobDescriptionUrl: z.string().url(),
});

export type CreateApplication = z.infer<typeof CreateApplicationSchema>;

export const ApplicationSchema = z.object({
  folderId: z.string(),
  jobTitle: z.string().nullable(),
  jobDescriptionUrl: z.string().url().nullable(),
  companyName: z.string(),
});

export type Application = z.infer<typeof ApplicationSchema>;
