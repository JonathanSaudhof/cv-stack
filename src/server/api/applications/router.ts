import {
  type Application,
  CreateApplicationSchema,
} from "@/feature/application/schema";
import applicationService from "@/feature/application/service";
import { getOrCreateConfigFile } from "@/feature/file-explorer/services";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import cacheTags from "../cache-tags";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const cachedApplications = (userId: string) =>
  unstable_cache(
    (folderId: string) => applicationService.getAllApplications(folderId),
    [cacheTags.applications.list(userId)],
    {
      tags: [cacheTags.applications.list(userId)],
    },
  );

const cachedGetMetaDataInFolder = (applicationId: string, userId: string) =>
  unstable_cache(
    () => applicationService.getMetaDataInFolder(applicationId),
    [cacheTags.applications.metadata(applicationId)],
    {
      tags: [
        cacheTags.applications.list(userId),
        cacheTags.applications.metadata(applicationId),
      ],
    },
  );

export const applicationsRouter = createTRPCRouter({
  createApplication: protectedProcedure
    .input(CreateApplicationSchema)
    .mutation(async ({ input }) => {
      const config = await getOrCreateConfigFile();

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
    .query(async ({ input, ctx }) => {
      const rawApplications = await cachedApplications(ctx.session.user.id!)(
        input.folderId,
      );

      if (!rawApplications) {
        return [];
      }

      const metadataFiles = await Promise.all(
        rawApplications.map((application) =>
          cachedGetMetaDataInFolder(application.id!, ctx.session.user.id!)(),
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
