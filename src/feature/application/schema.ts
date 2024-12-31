import { z } from "zod";

export const CreateApplicationSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  jobDescriptionUrl: z.string().url(),
});

export type CreateApplication = z.infer<typeof CreateApplicationSchema>;

export const ApplicationSchema = CreateApplicationSchema.extend({
  folderId: z.string(),
});

export type Application = z.infer<typeof ApplicationSchema>;
