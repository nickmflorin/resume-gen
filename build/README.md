# build/

Everything under `build/output/` is **generated** and gitignored. Never edit it by hand; the next
build overwrites it. This README is committed so the folder explains itself.

Regenerate everything with `npm run dist` (requires `nvm use` first — Node 22).

## What gets produced

| Path                             | What it is                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `output/resume_html/`            | The multi-page site. `page-1.html`, `page-2.html`, `page-3.html` are one physical 8.5x11 sheet each; `index.html` stacks all three for reading on screen. Works over `file://` with no server. |
| `output/resume.html`             | One self-contained file, CSS + fonts + images inlined as data URIs. This is the one to email or upload.                                       |
| `output/Resume-<timestamp>.pdf`  | The print-ready PDF, 3 pages at 8.5x11in. Named with the time of the run, so previous exports are preserved rather than overwritten.           |

## How the PDF is made

Headless Chrome renders each `page-N.html` to its own single-page PDF, then `pypdf` concatenates
them. Rendering per sheet rather than printing one long document is what guarantees no role is
ever split across a page break.
