"use server";
import fs from "fs";
import path from "path";

export function saveTemplateAsJson(
  document: object,
  type: "cv" | "state_sheet",
) {
  "use server";
  fs.writeFileSync(
    path.join(process.cwd(), "/src/templates", `${type}.json`),
    JSON.stringify(document, null, 2),
  );
}
