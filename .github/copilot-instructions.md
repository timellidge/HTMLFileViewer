# Copilot Instructions — HTMLFileViewer

## Project Overview

This is an **SPFx 1.18.2** web part (SharePoint Framework) built with **React 17**, **TypeScript 4.7**, and **PnP JS v2**. It renders HTML files from SharePoint document libraries with automatic Table of Contents generation and inter-web-part communication via DynamicProperty.

## Key Technical Context

- **Framework:** SPFx (`BaseClientSideWebPart`) — not a standalone React app
- **Build system:** Gulp (`gulp build`, `gulp bundle --ship`, `gulp package-solution --ship`)
- **Package manager:** npm (not yarn)
- **Node version:** 18.19.0 (engines: 16.13+ or 18.17+)
- **Lint:** ESLint with `@microsoft/eslint-config-spfx` and `@voitanos/eslint-preset-spfx-react`
- **CSS:** SCSS modules (`.module.scss`) — Fluent UI `mergeStyles` for dynamic styles only
- **State management:** React hooks (useState, useEffect, useCallback, useMemo, useRef)
- **HTML sanitization:** DOMPurify with strict allowlist config (no scripts, styles, iframes, inline styles)

## File Structure

| File | Purpose |
|---|---|
| `src/webparts/htmlFileViewer/HtmlFileViewerWebPart.ts` | Main web part class — init, render, property pane, CSS injection |
| `src/webparts/htmlFileViewer/components/HtmlFileViewerContainer.tsx` | Main React component — fetch, sanitize, TOC, display |
| `src/webparts/htmlFileViewer/components/HtmlFileViewer.module.scss` | All component styles |
| `src/webparts/htmlFileViewer/components/HtmlFileViewerHeader.tsx` | Title bar |
| `src/webparts/htmlFileViewer/components/HtmlFileViewerPlaceholder.tsx` | Configuration placeholder |
| `src/webparts/htmlFileViewer/components/HtmlFileViewerErrorMessage.tsx` | Error message bar |
| `src/helpers/Utilities.ts` | Shared utility functions (validation, CAML, formatting) |
| `src/helpers/Interfaces.ts` | Shared TypeScript interfaces and Zod schemas |
| `config/package-solution.json` | Solution version and feature config |
| `scripts/increment-version.js` | Auto-increment version on `npm run package:prod` |

## Code Conventions

- **No `any` types** — use proper TypeScript types or `typeof import(...)` for lazy-loaded modules
- **No `console.log` in production code** — removed for security (prevents SharePoint path leakage)
- **Constants outside components** — `SANITIZE_CONFIG`, `TOC_COLLAPSE_DELAY_MS`, `MAX_CONTENT_SIZE` are module-level
- **Pure functions outside components** — `sanitizeAndProcessHtml()` has no dependency on React state
- **Memoize expensive operations** — `useMemo` for `mergeStyles`, `useCallback` for handlers and fetch functions
- **Timer refs** — typed as `ReturnType<typeof setTimeout>`, cleaned up on unmount, explicit `!== null` checks
- **CSS injection** — uses `style.textContent` (never `innerHTML`) to prevent XSS

## Security Rules

When modifying HTML rendering or sanitization:
- Never add `style` to `ALLOWED_ATTR` — all styling comes from the web part's injected CSS
- Never add `script`, `style`, `iframe`, `object`, `embed`, or `form` to `ALLOWED_TAGS`
- Always re-sanitize if HTML is modified after initial sanitization (e.g. adding IDs for TOC)
- Escape single quotes in OData filter queries (`'` → `''`)
- Validate constructed file paths don't traverse outside the expected folder
- Keep `MAX_CONTENT_SIZE` guard before processing fetched content

## Build & Deploy

```bash
npm run dev           # Local dev server
npm run build         # Debug build
npm run package:prod  # Production build (auto-increments version)
```

The `.sppkg` output goes to `sharepoint/solution/`.

## README Maintenance

**Keep `README.md` up to date** whenever you make changes that affect:
- Features or user-facing behaviour
- Configuration options (property pane properties)
- Security model (sanitization rules, allowed tags/attributes)
- Dependencies (added, removed, or upgraded)
- Build scripts or deployment process
- Project structure (new files or folders)
- Architecture or data flow

When updating the README, preserve the existing section structure and update only the relevant sections. The README serves as the primary documentation for this project.

## DynamicProperty Pattern

The web part receives a document name from connected web parts via `DynamicProperty<string>`:
- Registered once in `onInit()` (never in `render()` — causes infinite loops)
- Read in `render()` via `tryGetValue()`
- Passed to the React component as the `receivedDocName` prop
- The container's `useEffect` uses priority routing: `receivedDocName` > `selectedHtmlFile` > empty state
