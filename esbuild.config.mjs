import esbuild from "esbuild";
import { readFileSync } from "fs";

const banner = readFileSync("banner.js", "utf8");

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  platform: "browser",
  format: "cjs",
  target: "es2020",
  sourcemap: "inline",
  external: ["obsidian"],
  banner: { js: banner }
});

if (process.argv.includes("--watch")) {
  await context.watch();
  console.log("Watching for changes...");
} else {
  await context.rebuild();
  await context.dispose();
  console.log("Build complete.");
}
