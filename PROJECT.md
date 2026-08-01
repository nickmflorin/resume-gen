# Resume — Project Tracker

**Owner:** Nick Florin (nickmflorin@gmail.com) · **Started:** 2026-08-01

**Purpose:** An app for iterating on the resume over time, with or without Claude, that builds to a
single HTML file and a PDF. Long term this is intended to merge into the personal website
(`nickmflorin/nick.florin`), but the two are deliberately unconnected for now.

## Origin

Two sources were combined on 2026-08-01:

1. **`nickmflorin/app-router-guide`** — the structural template. Astro 6 + Tailwind 4 (via
   `@tailwindcss/vite`) + SCSS partials, a `@theme static` token block as the single source of truth
   for the palette, data-driven pages, Python postbuild scripts, and the `CLAUDE.md` → `CONTEXT.md`
   / `PROJECT.md` documentation split. The guide's Prisma/SQLite layer, page-notes annotation
   system, slide-deck system, and search index were **not** carried over.
2. **`~/ai/career`** — the resume content. The hand-written `resume/` folder (`style.css` +
   `page-1..3.html`, tokens extracted from `Branding2.sketch`), the logo/headshot images, the
   `render-resume-pdf.sh` Chrome+pypdf pipeline, and the markdown records. The `.sketch` files were
   excluded per Nick.

## Decisions log

- **2026-08-01: Content is structured data, not markup (per Nick).** `src/data/` holds the resume as
  typed objects; `src/components/` are pure renderers. Chosen over a 1:1 markup port so the resume
  can be edited without touching HTML and so tailored per-application variants stay cheap later.
- **2026-08-01: Styling is SCSS partials over `@theme static` tokens (per Nick).** Mirrors the
  guide. Tailwind utilities are available but the design system is authored in SCSS, because print
  typography tuned to fractions of a pixel fights Tailwind's default scale. Preflight is
  deliberately not imported.
- **2026-08-01: Page breaks are assigned by hand (per Nick).** `SHEETS` in `src/data/pages.ts`
  decides which roles land on which sheet; each sheet is a standalone document that clips overflow.
  Chosen over a single flowing document because per-sheet rendering makes a mid-role page break
  structurally impossible in the PDF. Accepted cost: adding content requires manual rebalancing, and
  overflow is silently clipped.
- **2026-08-01: `content/` holds local records that are not build inputs.** Motivated by losing
  access to the systems the material came from. Nothing in it renders.
- **2026-08-01: Mona Sans is vendored (needs Nick's sign-off).** The original `style.css` asked for
  Mona Sans but nothing ever shipped it and it is not installed on Nick's machine, so every PDF to
  date silently rendered in San Francisco via the `-apple-system` fallback. The font is now vendored
  into `public/assets/fonts/` (OFL) so builds are reproducible anywhere, including inside headless
  Chrome. **This changes rendering:** Mona Sans is narrower, so content takes roughly 7% less
  vertical height than the previous exports. To revert, drop the `@use 'partials/fonts'` line from
  `src/styles/style.scss`.
- **2026-08-01: `Nick Florin2` corrected to `Nick Florin`.** The name was a leftover render-test
  string in all three source pages. This is the only content difference between the original HTML
  and the port; the rendered text is otherwise word-for-word identical.
- **2026-08-01: Node 22 pinned via `.nvmrc`.** Astro 6 requires >=22.12 and the machine default is
  20.19.1. Node 22 was installed alongside it; the default was left alone.
- **2026-08-01: Single Vite version forced via an `overrides` entry.** `@tailwindcss/vite` resolves
  its own Vite major, which lands two copies in the tree and fails the build on a binding mismatch
  (`Missing field tsconfigPaths`). The override pins one Vite for the whole tree.

## Status

- [x] Scaffold: Astro app, data model, components, styles, build scripts, docs.
- [x] Port verified: class structure and rendered text identical to the original three pages.
- [x] Distributables: multi-page HTML, single-file HTML, 3-page PDF at 8.5x11in.
- [ ] Nick to confirm the Mona Sans change (or revert it).
- [x] **Craft experience record regenerated (2026-08-01)** from `ce-software/craft` while access
      lasted: `content/craft-portfolio.md` (narrative, provenance-marked, PR-cited) plus
      `content/craft-pr-log.md` (all 1,255 authored PRs, chronological). Deliberately NOT wired into
      the resume HTML; it is a record only, per Nick.
- [ ] Resume content rewrite against `content/improvements.md` + `content/feedback.md` (NOT started;
      the porting pass deliberately changed no wording).
- [ ] Eventual merge into the personal website.

## Open content questions (deliberately not acted on)

- The Craft role still reads `Oct 2024 - Present`. Nick's last day was 2026-07-31.
- The resume claims "Reduced average TTI ~60% and LCP ~50%". The craft repository does NOT
  substantiate these figures: the relevant PR (#6719) labels its metrics table "directional
  estimates, not measured results", and the real numbers lived in Datadog RUM, which is no longer
  accessible. The structural claims (3 render-blocking requests on the critical path reduced to 0,
  full-page loading screen eliminated, pre-rendering restored) ARE supported. See the caveat in
  `content/craft-portfolio.md`.
- `content/improvements.md` and `content/feedback.md` describe substantial rewrites (stronger
  tagline, architecture framed as patterns rather than feature specifics, removal of Statsig /
  ESLint / `@craft/logger` specifics, Sentry alongside Datadog). None have been applied.
