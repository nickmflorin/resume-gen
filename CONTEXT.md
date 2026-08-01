# CONTEXT — read this first

Orientation and working rules for this repo. `PROJECT.md` is the history and decisions log; this
file is the map.

---

## What this repo is

**Nick Florin's resume**, as an app rather than a document. Astro 6 (static) + Tailwind 4 (via
`@tailwindcss/vite`, tokens only) + SCSS. The resume is **structured data** rendered by components,
so editing it means editing `src/data/`, not markup.

It builds three distributables into `build/output/` (gitignored, regenerate with `npm run dist`):

- `resume_html/` — the multi-page site: `page-1.html`, `page-2.html`, `page-3.html` (one physical
  sheet each) plus `index.html` (all sheets stacked, for reading on screen).
- `resume.html` — one self-contained file with CSS, fonts, and images inlined as data URIs.
- `Resume-<Mon>-<DD>-<YYYY>-<h:mm><am|pm>.pdf` — the print-ready PDF, uniquely named per run so
  older exports are never overwritten.

---

## Repo map

- `src/data/` — **THE CONTENT.** `profile.ts` (name, about, contact), `experience.ts` (every role),
  `skills.ts` (sidebar sections), `education.ts` (degrees), `pages.ts` (which roles and sidebar
  sections land on which sheet), `types.ts` (the shape of all of it).
- `src/components/` — pure renderers over that data: `Sheet`, `Sidebar`, `Role`, `Education`,
  `DevHeader`, `SkillBar`, `Pills`.
- `src/layouts/ResumePage.astro` — the document shell; imports the styles.
- `src/pages/[sheet].astro` — one standalone document per sheet, generated from `SHEETS`.
  `src/pages/index.astro` — every sheet stacked in one document.
- `src/styles/tailwind.css` — the `@theme static` block: **the single source of truth for the
  palette, fonts, and sheet geometry.** `src/styles/style.scss` + `partials/*` — the design system.
- `public/assets/logos/` — company and school logos, icons, the headshot. `public/assets/fonts/` —
  Mona Sans (vendored, OFL).
- `scripts/` — `postbuild_relativize.py`, `build_pdf.py`, `build_artifact.py`.
- `content/` — **local records, not part of the build.** See below.

---

## The content/ folder

`content/` exists so information about Nick's experience is not lost when access to the systems it
came from goes away. It is source material for writing the resume; nothing in it is rendered.

- `craft-portfolio.md` — detailed record of the Craft Education work (Oct 2024 – Jul 2026),
  regenerated 2026-08-01 from the `ce-software/craft` repository and its GitHub history before
  access ended. Claims are marked as repo-verified or carried over from the earlier draft, and PR
  numbers are cited so any claim can be traced. The deep version; the resume carries a compressed
  form of it.
- `craft-pr-log.md` — all 1,255 pull requests Nick authored in that repository, chronological. The
  raw source behind `craft-portfolio.md`, kept so the underlying evidence survives independently of
  the narrative written from it.
- `resume.md` — a full prose/table form of the resume content.
- `improvements.md` — what Nick wants the resume to emphasize, in his own words.
- `feedback.md` — specific edit requests against earlier drafts.
- `reference/original-resume-html/` — a frozen byte-for-byte snapshot of the hand-written HTML
  resume this app was ported from, plus its original render script. Superseded by `src/`; kept as a
  record. Prettier and cspell both ignore it.

---

## Editing the resume

1. **Change wording, add a role, adjust a skill** → edit the matching file in `src/data/`.
2. **Change how something looks** → edit the partial in `src/styles/partials/` that owns it. Colors,
   fonts, and sheet dimensions are tokens in `src/styles/tailwind.css`; change them there and
   nowhere else.
3. **Move content between pages** → edit `SHEETS` in `src/data/pages.ts`.

Inline HTML (`<em>`, `<strong>`, `<code>`) is allowed in prose fields and is rendered as markup.
Copy is authored as indented template literals; the components collapse authoring whitespace, so
indentation in the data files is free.

---

## Pagination: the thing to know

Page breaks are **assigned by hand** in `src/data/pages.ts`, not flowed by CSS. Each sheet is a
standalone 8.5x11 document that **clips** its overflow, which is what makes a mid-role page break
impossible in the PDF.

The tradeoff: adding content does not reflow onto the next page, it gets cut off. After adding
anything substantial, look at `index.html` (via `npm run dev`) where each sheet is drawn with a
visible boundary, and rebalance `SHEETS` if content runs past the bottom edge.

---

## Commands

`npm run dev` — live sheets with HMR. `npm run build` — the multi-page site. `npm run pdf` — the PDF
(build first). `npm run artifact` — the single-file HTML (build first). `npm run dist` — all three.
`npm run format` / `format:check` — Prettier.

**Node 22+ is required** (Astro 6). The repo pins it with `.nvmrc`; run `nvm use` in a new shell.
The machine default is Node 20, so a shell that has not run `nvm use` will fail the build with a
version error.

`build_pdf.py` needs Google Chrome at the standard macOS path and creates a cached virtualenv at
`~/.cache/resume-pdf-venv` for `pypdf` on first run.

---

## Verify before committing

1. `npm run build` exits 0 and prints `relativize: clean`.
2. `npm run pdf` produces a **3-page** PDF at 8.5x11in.
3. If layout or content changed, look at the rendered sheets. Content clipped at a sheet boundary is
   a silent failure; nothing checks it for you.
