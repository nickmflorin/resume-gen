# Claude — start here

Read the context doc before doing anything. It is the repo map, the data model, the build commands,
and the pagination rule that most changes have to respect.

@CONTEXT.md

`PROJECT.md` holds the history and decisions log; read it when you need the "why". It is not
imported here to keep sessions light.

## Non-negotiables

- **The resume's content lives in `src/data/`, never in markup.** A change to wording, a role, a
  skill, or a date is a change to a data file.
- **`src/styles/tailwind.css` is the only place colors, fonts, and sheet dimensions are defined.**
  Never hardcode a hex value or a dimension in a partial; reference the token.
- **Pages do not reflow.** Each sheet clips its overflow, so adding content can silently cut off the
  bottom of a page. After any content change, verify the sheet still fits and rebalance `SHEETS` in
  `src/data/pages.ts` if it does not.
- **Run the build/verify gate before committing** (see CONTEXT.md): `npm run build` exits 0 and
  prints `relativize: clean`, and `npm run pdf` produces a 3-page PDF.
- **Node 22+** — run `nvm use` first; the machine default is Node 20 and Astro 6 rejects it.
- **`content/` is a record, not a build input.** Nothing in it is rendered. Do not wire it into the
  HTML without being asked; adding material to it is always safe.
- **`content/reference/` is frozen.** It is a snapshot of the pre-Astro resume, kept byte-for-byte.
  Never reformat or "fix" it.
- **Read `docs/content-model.md` before touching the content model in `src/data/types.ts`,
  `src/lib/normalize.ts`, `src/lib/syndication.ts`, or writing any Prisma migration in
  `nick.florin`.** It holds the target schema, the mapping from the existing `Detail` /
  `NestedDetail` models, the invariants Postgres cannot enforce, and the reason behind each
  decision. Several parts of the shape look arbitrary and are not; reversing one without the
  rationale reintroduces a solved problem.
- **The syndication cascade lives in exactly one place.** Nothing outside `src/lib/syndication.ts`
  may read `visible` or `excludedChannels`; render from the `Resolved*` types it returns.
