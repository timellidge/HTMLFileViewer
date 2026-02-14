# HTML File Viewer — SPFx Web Part

A SharePoint Framework (SPFx) web part that renders HTML files stored in SharePoint document libraries, with automatic Table of Contents generation and inter-web-part communication via Dynamic Properties.

---

## Features

- **Display HTML from SharePoint** — Select an HTML file from any document library and render it inline on a SharePoint page
- **Dynamic Document Loading** — Receive a document name from another web part (e.g. TableViewer, CardViewer) via SPFx `DynamicProperty` and load the corresponding HTML file automatically
- **Auto-generated Table of Contents** — Extracts H1/H2 headings and builds a collapsible, sticky TOC sidebar with smooth-scroll navigation
- **Custom CSS Injection** — Site editors can add custom CSS via the property pane code editor to style the rendered HTML content
- **Configurable Layout** — Set content height, side padding (gutter), show/hide title, custom empty-state messages
- **Security Hardened** — All HTML is sanitized through DOMPurify with strict allowlists; no scripts, styles, iframes, or event handlers are rendered

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 16.13+ or 18.17+ |
| SPFx | 1.18.2 |
| SharePoint | Online (modern pages) |

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev          # Start local workbench (gulp serve --nobrowser)
npm run build        # Debug build (gulp bundle)
```

### Production build & package

```bash
npm run package:prod
```

This automatically:
1. Increments the version number in `config/package-solution.json`
2. Runs `gulp clean`, `gulp bundle --ship`, `gulp package-solution --ship`
3. Outputs the `.sppkg` file to `sharepoint/solution/`

### Deploy

Upload the `.sppkg` file from `sharepoint/solution/` to your SharePoint App Catalog.

---

## Configuration (Property Pane)

### Page 1 — Configuration

| Property | Description |
|---|---|
| **Web Part Tag** | Unique identifier used to scope injected CSS to this web part instance |
| **Site** | SharePoint site URL containing the document library (validated on input) |
| **List** | Document library picker — select the library containing your HTML files |
| **HTML File** | Dropdown of `.html`/`.htm` files from the selected library |
| **Show Title** | Toggle the web part title bar on/off |
| **Hide On Error or Empty** | When enabled, hides the web part entirely instead of showing error/empty messages |
| **Message to show when empty** | Custom message displayed when no content is loaded |
| **Set a gutter width (px)** | Side padding slider (0–200px, step 10) |
| **Content Height** | CSS height value for the content container (e.g. `400px`, `50vh`) |

### Page 2 — Additional CSS

| Property | Description |
|---|---|
| **Web Part CSS** | Code editor for custom CSS rules applied to the rendered HTML content |

---

## Dynamic Property Communication

This web part can receive a document name from another connected web part using SPFx Dynamic Properties.

### How it works

1. A source web part (e.g. TableViewer) publishes a `string` value (the document name)
2. HTMLFileViewer receives it via the `docName` DynamicProperty
3. The web part constructs the file path: `{folder of selectedHtmlFile}/{docName}.html`
4. If no `selectedHtmlFile` is configured, it falls back to querying the document library by filename

### Priority order

| Priority | Source | When used |
|---|---|---|
| 1 | `receivedDocName` (from connected web part) | When a dynamic property value is available |
| 2 | `selectedHtmlFile` (from property pane) | When no dynamic value is received |
| 3 | Empty state | When neither is available |

### Connecting web parts

1. Edit the SharePoint page
2. Select the HTMLFileViewer web part
3. In the property pane, find the `docName` property
4. Click "Connect to source" and select the source web part and property

---

## Table of Contents (TOC)

The TOC is automatically generated from H1 and H2 headings in the rendered HTML.

- **Collapsed state** — A narrow vertical sidebar (35px) showing an icon, "T.O.C." label, and the document title in vertical text
- **Expanded state** — Opens to 280px on hover, showing a scrollable list of heading links
- **Smooth scroll** — Clicking a TOC entry scrolls to the corresponding heading within the content area
- **Keyboard accessible** — TOC header supports Enter/Space to toggle, fully ARIA-labelled

### Heading ID generation

| Heading | Generated ID |
|---|---|
| 1st H1 | `Index1` |
| 2nd H1 | `Index2` |
| 1st H2 under H1 #1 | `Index1_1` |
| 2nd H2 under H1 #1 | `Index1_2` |
| 1st H2 under H1 #2 | `Index2_1` |

If a heading already has an `id` attribute, it is preserved.

---

## Security

### HTML Sanitization

All fetched HTML is processed through DOMPurify with a strict configuration:

**Allowed tags:** `p`, `br`, `strong`, `em`, `u`, `h1`–`h6`, `ul`, `ol`, `li`, `a`, `img`, `div`, `span`, `table`, `tr`, `td`, `th`, `thead`, `tbody`, `tfoot`, `section`, `article`, `header`, `footer`, `blockquote`, `pre`, `code`, `hr`, `b`, `i`, `small`, `sub`, `sup`

**Explicitly forbidden:** `script`, `style`, `link`, `iframe`, `object`, `embed`, `form`

**Allowed attributes:** `href`, `src`, `alt`, `class`, `id`, `title`, `target`

**Forbidden attributes:** `style`, `onerror`, `onload`, `onclick`, `onmouseover`

**Data attributes:** Disabled

### Additional protections

- **CSS injection prevention** — Custom CSS is injected via `style.textContent` (not `innerHTML`), preventing HTML injection through CSS property values
- **OData injection prevention** — Document names used in SharePoint list queries have single quotes escaped (`'` → `''`)
- **Path traversal prevention** — Constructed file paths are validated to stay within the expected folder
- **Content size limit** — Files larger than 5MB are rejected before processing
- **Race condition handling** — Rapid document switching cancels stale fetch results
- **No data leakage** — No `console.log` calls in production code

---

## Project Structure

```
src/
├── index.ts                          # Entry point
├── helpers/
│   ├── Utilities.ts                  # Shared utility functions
│   └── Interfaces.ts                 # Shared TypeScript interfaces
└── webparts/
    └── htmlFileViewer/
        ├── HtmlFileViewerWebPart.ts  # Web part class (init, render, property pane)
        ├── HtmlFileViewerWebPart.manifest.json
        ├── loc/                      # Localization strings
        └── components/
            ├── HtmlFileViewerContainer.tsx    # Main React component
            ├── HtmlFileViewerHeader.tsx       # Title bar component
            ├── HtmlFileViewerTitle.tsx        # Editable title component
            ├── HtmlFileViewerPlaceholder.tsx  # Configuration placeholder
            ├── HtmlFileViewerErrorMessage.tsx # Error message bar
            ├── HtmlFileViewer.module.scss     # Component styles
            └── HtmlFileViewer.module.scss.ts  # CSS module type definitions

config/                    # SPFx build configuration
scripts/
└── increment-version.js   # Auto-increment version on production build
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  HtmlFileViewerWebPart.ts                               │
│  ├── onInit(): PnP setup, DynamicProperty registration  │
│  ├── render(): Read docName, inject CSS, create element  │
│  ├── injectCSS(): Scoped <style> via textContent        │
│  └── Property pane: site, list, file, CSS editor        │
│                          │                              │
│                          ▼                              │
│  HtmlFileViewerContainer.tsx                            │
│  ├── sanitizeAndProcessHtml(): Single-pass sanitize+TOC │
│  ├── fetchHtmlContent(): Load by server-relative path   │
│  ├── fetchHtmlContentByDocName(): Load by doc name      │
│  ├── useEffect: Priority routing + cancellation         │
│  └── Render: Header → Loading/Error/Content/Empty       │
│                          │                              │
│              ┌───────────┼───────────┐                  │
│              ▼           ▼           ▼                  │
│         TOC sidebar  HTML content  Error bar            │
│        (collapsible) (sanitized)  (dismissable)         │
└─────────────────────────────────────────────────────────┘
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@pnp/sp` v2 | SharePoint REST API (files, lists, webs) |
| `@fluentui/react` 8.x | UI components (Spinner, Icon, MessageBar) |
| `dompurify` 3.x | HTML sanitization |
| `@pnp/spfx-property-controls` 3.x | Property pane controls (list picker, code editor) |
| `@pnp/spfx-controls-react` 2.x | Placeholder component |
| `luxon` 3.x | Date parsing (shared utilities) |

---

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `gulp serve --nobrowser` | Local development server |
| `build` | `gulp bundle` | Debug build |
| `clean` | `gulp clean` | Clean build artifacts |
| `package:dev` | `clean → bundle → package-solution` | Development package |
| `package:prod` | `increment-version → clean → bundle --ship → package-solution --ship` | Production package with auto-version |

---

## Author

**Tim Ellidge** — [tim.ellidge@JustM365.co.uk](mailto:tim.ellidge@JustM365.co.uk)