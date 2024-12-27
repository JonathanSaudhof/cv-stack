import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getConfigFile } from "@/feature/file-explorer/services";
import applicationService from "@/feature/application/service";

export const applicationsRouter = createTRPCRouter({
  createApplication: protectedProcedure
    .input(
      z.object({
        companyName: z.string(),
      }),
    )
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
        companyName: input.companyName,
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
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      ),
    )
    .query(async ({ input }) => {
      const rawApplications = await applicationService.getAllApplications(
        input.folderId,
      );
      if (!rawApplications) {
        return [];
      }

      return rawApplications.map((application) => ({
        id: application.id ?? "",
        name: application.name ?? "",
      }));
    }),
});
