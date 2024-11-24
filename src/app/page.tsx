import { env } from "@/env";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { google } from "googleapis";

async function getAllFiles() {
  const session = await auth();
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const accessToken = session?.access_token;
  const refreshToken = session?.refresh_token;

  const oauth = new google.auth.OAuth2({
    clientId,
    clientSecret,
  });

  oauth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const drive = google.drive({ auth: oauth, version: "v3" });

  await drive.files
    .list({ spaces: "appDataFolder" })
    .then((data) => {
      console.debug(data.data);
    })
    .catch((e) => {
      throw e;
    });
}

export default async function Home() {
  await getAllFiles();
  return (
    <HydrateClient>
      <main>WHAT?</main>
    </HydrateClient>
  );
}
