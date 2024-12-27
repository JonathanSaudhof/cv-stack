import {
  createNewApplication,
  getAllApplications,
} from "@/feature/application/services";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getConfigFile } from "@/feature/file-explorer/services";

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
      await createNewApplication({
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
    .query(async ({ input }) => {
      return await getAllApplications(input.folderId);
    }),
});
