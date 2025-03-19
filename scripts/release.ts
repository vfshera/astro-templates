import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cleanUp,
  createRootReadme,
  generateTemplate,
  getTimestampVersion,
  loadTemplates,
  prepare,
} from "./utils";
import { intro, outro, tasks } from "@clack/prompts";
import c from "tinyrainbow";
import { BLANK_TEMPLATE_NAME, BUILD_TEMPLATES_DIR } from "./constants";

import { x } from "tinyexec";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const templatesDir = path.join(scriptDir, "templates");

(async () => {
  intro(c.bgCyan(c.black(c.bold(" Start Astro "))));

  await prepare(scriptDir);

  const templates = await loadTemplates(templatesDir);

  await tasks(
    templates.map((t) => {
      return {
        title: `Creating ${t.title}`,
        async task() {
          await generateTemplate(
            t,
            path.join(scriptDir, "..", BUILD_TEMPLATES_DIR, t.name),
            path.join(scriptDir, BLANK_TEMPLATE_NAME)
          );

          return `${t.title} created!`;
        },
      };
    })
  );

  await createRootReadme(templates, path.join(scriptDir, ".."));

  await cleanUp(scriptDir);

  await x("pnpm", ["lint:fix"], {
    nodeOptions: { stdio: "inherit" },
  });

  const version = getTimestampVersion();

  await x("git", ["commit", "-am", `chore: 🎉 Release ${version}`], {
    nodeOptions: { stdio: "inherit" },
  });

  outro(`${c.bold(c.green("Done!"))} New version: ${version}`);
})();
