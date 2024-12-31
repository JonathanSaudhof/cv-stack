import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getConfigFile } from "@/feature/file-explorer/services";
import applicationService from "@/feature/application/service";
import {
  type Application,
  CreateApplicationSchema,
} from "@/feature/application/schema";

export const applicationsRouter = createTRPCRouter({
  createApplication: protectedProcedure
    .input(CreateApplicationSchema)
    .mutation(async ({ input }) => {
      const config = await getConfigFile();

      if (!config) {
        throw new Error("Config file not found");
      }

      if (!config.folderId) {
        throw new Error("Config file is missing folderId");
      }

      if (!config.defaultTemplateDocId) {
        throw new Error("Config file is missing defaultTemplateDocId");
      }

      await applicationService.createNewApplication({
        data: input,
        baseFolderId: config?.folderId,
        templateDocId: config?.defaultTemplateDocId,
      });
    }),
  getAllApplications: protectedProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const rawApplications = await applicationService.getAllApplications(
        input.folderId,
      );
      if (!rawApplications) {
        return [];
      }

      const metadataFiles = await Promise.all(
        rawApplications.map((application) =>
          applicationService.getMetaDataInFolder(application.id!),
        ),
      );

      const applications: Application[] = rawApplications.map(
        (application, index) => {
          const metadata = metadataFiles[index];
          return {
            folderId: application.id!,
            companyName: application.name ?? "",
            ...metadata!,
          };
        },
      );

      return applications;
    }),
});
