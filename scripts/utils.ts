import fs from "node:fs/promises";
import { glob } from "tinyglobby";
import { featureSchema, templateSchema } from "./schema";
import path from "node:path";
import { x } from "tinyexec";
import { BLANK_TEMPLATE_NAME } from "./constants";
import defu from "defu";
import { setTimeout as sleep } from "node:timers/promises";

import { log, spinner } from "@clack/prompts";
const s = spinner();

export async function pathExists(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
export async function createBlankTemplate(scriptDir: string) {
  await sleep(100);
  s.start("creating a blank template");
  try {
    await x(
      "pnpm",
      [
        "create",
        "astro@latest",
        "--no-git",
        "--no-install",
        "--template",
        "minimal",
        BLANK_TEMPLATE_NAME,
      ],
      { nodeOptions: { cwd: scriptDir } }
    );
    s.stop("blank template created!");
    await sleep(100);
    s.start("updating tsconfig.json");
    const tsconfigPath = path.join(
      scriptDir,
      BLANK_TEMPLATE_NAME,
      "tsconfig.json"
    );
    const tsconfigContents = JSON.parse(
      await fs.readFile(tsconfigPath, "utf-8")
    );

    await fs.writeFile(
      tsconfigPath,
      JSON.stringify(
        defu(tsconfigContents, {
          compilerOptions: {
            baseUrl: ".",
            paths: {
              "~/*": ["src/*"],
            },
          },
        }),
        null,
        2
      )
    );
    s.stop("tsconfig.json updated!");
  } catch (e) {
    s.stop("Failed to create a blank template");
  }
}

export async function prepare(scriptDir: string) {
  if (await pathExists(path.join(scriptDir, BLANK_TEMPLATE_NAME))) {
    await x("rm", ["-rf", BLANK_TEMPLATE_NAME], {
      nodeOptions: { cwd: scriptDir },
    });
  }
  await sleep(100);

  await createBlankTemplate(scriptDir);
}
export async function loadFeatures(featuresDir: string) {
  const features = await glob(`${featuresDir}/*/feature.json`);

  return Promise.all(
    features.map(async (feature) => {
      const featureJsonPath = path.join(
        featuresDir,
        path.relative(featuresDir, feature)
      );

      const info = featureSchema.parse(
        JSON.parse(await fs.readFile(featureJsonPath, "utf-8"))
      );
      return {
        ...info,
        path: path.dirname(featureJsonPath),
      };
    })
  );
}

export async function loadTemplates(templatesDir: string) {
  const templates = await glob(`${templatesDir}/*/template.json`);

  return Promise.all(
    templates.map(async (template) => {
      const templateJsonPath = path.join(
        templatesDir,
        path.relative(templatesDir, template)
      );

      const info = templateSchema.parse(
        JSON.parse(await fs.readFile(templateJsonPath, "utf-8"))
      );
      return {
        ...info,
        path: path.dirname(templateJsonPath),
      };
    })
  );
}
