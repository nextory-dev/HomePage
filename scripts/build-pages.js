import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const sourceRoot = "src/pages";
const outputRoot = ".vite-pages";
const partialRoot = "src/partials";

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function listFiles(dir, matcher, files = []) {
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      listFiles(fullPath, matcher, files);
      continue;
    }
    if (matcher(fullPath)) files.push(fullPath);
  }
  return files;
}

function parseAttributes(raw) {
  const attrs = {};
  raw.replace(/([a-zA-Z-]+)="([^"]*)"/g, (_, key, value) => {
    attrs[key] = value;
    return "";
  });
  return attrs;
}

function navState(current) {
  return {
    home: current === "home" ? ' aria-current="page"' : "",
    company: current === "company" ? ' aria-current="page"' : "",
    solutions: current === "solutions" ? ' aria-current="page"' : "",
    news: current === "news" ? ' aria-current="page"' : "",
    support: current === "support" ? ' aria-current="page"' : "",
    careers: current === "careers" ? ' aria-current="page"' : "",
    contact: current === "contact" ? ' aria-current="page"' : ""
  };
}

function renderPartial(name, attrs) {
  const partial = readFileSync(join(partialRoot, `${name}.html`), "utf8");
  const depth = Number(attrs.depth || 0);
  const base = depth > 0 ? "../".repeat(depth) : "";
  const state = navState(attrs.current || "");
  return partial.replace(/\{\{([a-zA-Z0-9-]+)\}\}/g, (_, token) => {
    if (token === "base") return base;
    if (token in state) return state[token];
    return "";
  });
}

function renderPage(sourcePath) {
  const relativePath = relative(sourceRoot, sourcePath);
  const outputPath = join(outputRoot, relativePath);
  const html = readFileSync(sourcePath, "utf8").replace(
    /<!--\s*@include\s+(header|footer)([^>]*)-->/g,
    (_, name, rawAttrs) => renderPartial(name, parseAttributes(rawAttrs))
  );
  ensureDir(dirname(outputPath));
  writeFileSync(outputPath, html);
}

rmSync(outputRoot, { recursive: true, force: true });
ensureDir(outputRoot);

cpSync("src/index.css", join(outputRoot, "index.css"));
cpSync("src/index.js", join(outputRoot, "index.js"));
if (existsSync("src/assets")) {
  cpSync("src/assets", join(outputRoot, "assets"), { recursive: true });
}

for (const htmlFile of listFiles(sourceRoot, (file) => file.endsWith(".html"))) {
  renderPage(htmlFile);
}
