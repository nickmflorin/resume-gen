# resume-gen

Nick Florin's resume, as an app. The content is structured data; the pages, the single-file HTML,
and the PDF are all built from it.

Astro 6 · Tailwind 4 (tokens) · SCSS · Python build scripts.

## Quick start

```bash
nvm use          # Node 22 (Astro 6 requires >=22.12; the machine default is 20)
npm install
npm run dev      # live sheets at localhost, with HMR
```

## Building

```bash
npm run build     # -> build/output/resume_html/  (page-1..3.html + index.html)
npm run artifact  # -> build/output/resume.html   (one self-contained file)
npm run pdf       # -> build/output/Resume-<timestamp>.pdf  (3 pages, 8.5x11in)
npm run dist      # all three, in order
```

`npm run pdf` needs Google Chrome installed at the standard macOS path.

## Editing the resume

Everything the resume says lives in `src/data/`:

| File            | Holds                                                      |
| --------------- | ---------------------------------------------------------- |
| `profile.ts`    | Name, title, about paragraphs, highlights, contact details |
| `experience.ts` | Every role, in one array                                   |
| `skills.ts`     | The sidebar's skill bars and chip groups                   |
| `education.ts`  | Degrees                                                    |
| `pages.ts`      | Which roles and sidebar sections land on which sheet       |

Colors, fonts, and page dimensions are tokens in `src/styles/tailwind.css`. Component styling lives
in `src/styles/partials/`.

**Pages do not reflow.** Each sheet is a fixed 8.5x11 document that clips whatever does not fit,
which is what makes a mid-role page break impossible in the PDF. After adding content, check the
sheet still fits and rebalance `pages.ts` if it does not.

See `CONTEXT.md` for the full map and `PROJECT.md` for the history and decisions.

## content/

Local records used to write the resume: a detailed account of the Craft Education work, a prose form
of the resume, notes on what to emphasize, and a frozen snapshot of the hand-written HTML resume
this was ported from. None of it is part of the build.
