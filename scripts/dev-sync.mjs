import { spawn } from "child_process";
import { copyFile, mkdir, access } from "fs/promises";
import { constants, watch } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const targetDir = process.env.SIMPLE_KANBAN_DEPLOY ?? "/Users/rustling/Desktop/project_sha/01_simple_kanban/test_ob_plugin_vault/.obsidian/plugins/simple-kanban-sidebar";
const filesToSync = ["main.js", "styles.css", "manifest.json"];

async function copyOne(file, reason) {
  const source = path.join(projectRoot, file);
  const destination = path.join(targetDir, path.basename(file));
  try {
    await mkdir(targetDir, { recursive: true });
    await copyFile(source, destination);
    console.log(`[dev-sync] Copied ${file} -> ${destination} (${reason})`);
  } catch (error) {
    console.error(`[dev-sync] Failed to copy ${file}:`, error.message);
  }
}

async function ensureFileExists(file) {
  const source = path.join(projectRoot, file);
  while (true) {
    try {
      await access(source, constants.F_OK);
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

async function setupWatchers() {
  for (const file of filesToSync) {
    await ensureFileExists(file);
    await copyOne(file, "initial");
    const source = path.join(projectRoot, file);
    watch(source, { persistent: true }, async (eventType) => {
      if (eventType === "rename") {
        await ensureFileExists(file);
      }
      await copyOne(file, "change");
    });
    console.log(`[dev-sync] Watching ${source}`);
  }
}

function startEsbuild() {
  const child = spawn("node", ["esbuild.config.mjs", "--watch"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  child.on("close", (code) => {
    console.log(`[dev-sync] esbuild process exited with code ${code}`);
    process.exit(code ?? 0);
  });
  process.on("SIGINT", () => {
    child.kill("SIGINT");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
    process.exit(0);
  });
}

(async () => {
  console.log(`[dev-sync] Watching project at ${projectRoot}`);
  console.log(`[dev-sync] Deploying files to ${targetDir}`);
  await setupWatchers();
  startEsbuild();
})();
