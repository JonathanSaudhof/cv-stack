import {
  createConfigFile,
  getConfigFile,
  getDocumentById,
  getOrCreateConfigFile,
  updateConfigFile,
} from "@/feature/file-explorer/services";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const configRouter = createTRPCRouter({
  getConfigFile: protectedProcedure.query(async () => {
    const config = await getOrCreateConfigFile();

    return config;
  }),
  updateConfigFile: protectedProcedure
    .input(
      z.object({
        folderId: z.string().nullable(),
        defaultTemplateDocId: z.string().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const { folderId, defaultTemplateDocId } = input;

      const config = await getConfigFile();
      if (!config) {
        console.error("Config file not found");
        return null;
      }

      await updateConfigFile({
        ...config,
        folderId: folderId ?? config.folderId,
        defaultTemplateDocId:
          defaultTemplateDocId ?? config.defaultTemplateDocId,
      });

      return await getConfigFile();
    }),
  getTemplateFile: protectedProcedure.query(async () => {
    const config = await getOrCreateConfigFile();

    if (!config.defaultTemplateDocId) {
      console.error("Default template doc id not found");
      return null;
    }

    return await getDocumentById(config.defaultTemplateDocId);
  }),
});
