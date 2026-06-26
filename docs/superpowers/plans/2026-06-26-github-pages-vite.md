# GitHub Pages Vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the existing NEXTORY static site with Vite for GitHub Pages deployment.

**Architecture:** Existing HTML pages become source pages under `src/pages` and use shared header/footer partials. A small Node build script resolves partials into `.vite-pages`, then Vite emits a static `dist` folder.

**Tech Stack:** HTML, CSS, JavaScript, Node.js, Vite.

---

### Task 1: Repository And Build Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `scripts/build-pages.js`

- [x] Add Vite build scripts: `npm run dev`, `npm run prebuild`, `npm run build`, `npm run preview`.
- [x] Configure Vite with `base: "./"` and multi-page HTML inputs from `.vite-pages`.
- [x] Ignore `node_modules`, `dist`, `.vite-pages`, `.DS_Store`.
- [x] Commit with Korean message: `chore: Vite 빌드 기반 추가`.

### Task 2: Source Structure

**Files:**
- Move: `css/site.css` to `src/index.css`
- Move: `js/site.js` to `src/index.js`
- Move: production HTML files to `src/pages`
- Move: referenced BotfenderAI screenshots to `src/assets/botfenderai`
- Create: `src/partials/header.html`
- Create: `src/partials/footer.html`

- [x] Preserve all page body content.
- [x] Replace repeated header/footer in source pages with include comments.
- [x] Update references from `site.css` and `site.js` to Vite entry files.
- [x] Commit with Korean message: `refactor: 소스 구조와 공통 영역 정리`.

### Task 3: Cleanup And Verification

**Files:**
- Modify: source pages and build script as needed.
- Delete: unused generated images, unused PPTX, unused critique JSON, old root HTML/CSS/JS folders.

- [x] Run `npm install` if dependencies are missing.
- [x] Run `npm run build`.
- [x] Inspect `dist` file layout.
- [x] Commit with Korean message: `chore: GitHub Pages 빌드 검증`.
