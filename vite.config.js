import { resolve } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { defineConfig } from "vite";

const pagesRoot = resolve(".vite-pages");

function collectHtmlEntries(dir, entries = {}) {
  for (const name of readdirSync(dir)) {
    const fullPath = resolve(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectHtmlEntries(fullPath, entries);
      continue;
    }
    if (name.endsWith(".html")) {
      const key = fullPath
        .slice(pagesRoot.length + 1)
        .replace(/\.html$/, "")
        .replaceAll("/", "-");
      entries[key] = fullPath;
    }
  }
  return entries;
}

export default defineConfig({
  root: pagesRoot,
  base: "./",
  build: {
    outDir: resolve("dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: collectHtmlEntries(pagesRoot),
      output: {
        entryFileNames: "assets/index-[hash].js",
        chunkFileNames: "assets/index-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith(".css")) || assetInfo.name?.endsWith(".css")) {
            return "assets/index-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  }
});
