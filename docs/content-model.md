# The Content Model

Everything needed to carry `src/data/content-model.ts` into the Prisma schema in the `nick.florin`
repository: the target schema, the field mapping, the invariants Postgres cannot enforce, and the
reasoning behind each decision.

**Read this before changing `src/data/content-model.ts` or `src/lib/syndication.ts`, and read it in
full before writing any migration in `nick.florin`.** The shape looks arbitrary in places; it is
not, and the rationale is at the bottom.

---

## Status

- **Types and resolver: written.** `src/data/content-model.ts` and `src/lib/syndication.ts`.
- **Not wired into the build.** The rendered resume still runs on `Role.summary` / `Role.sections`
  in `src/data/experience.ts`. Nothing imports the content model yet.
- **Not in Prisma.** `nick.florin` has no syndication concept at all; this is a superset of what
  exists there, so landing it means changing that schema too.

The order of operations is deliberate: agree the shape here, convert this repo's data to it, and
only then migrate. Doing the Prisma work first would mean guessing at a shape that has never held
real content.

---

## The model in one picture

```
Role / Degree                      (separate models, both are ContentOwners)
 └── ContentNode                   (kind = SUMMARY | CONTENT, polymorphic to its owner)
      └── NestedContentNode        (list items / nested paragraphs — the last level)
```

Three rules define it:

1. **Two levels, hard stop.** Depth is capped by the schema, not by convention.
2. **One paragraph per row.** A section of three paragraphs is three rows. This granularity is the
   entire point: syndication is decided per paragraph.
3. **Syndication only ever narrows going down.** A child can withhold itself from a channel its
   parent publishes to; it can never publish itself to a channel its parent withheld.

---

## Target Prisma schema

Paste-ready, in `nick.florin` conventions (uuid primary keys, audit columns, `@db.Uuid`).

```prisma
enum SyndicationChannel {
  LINKEDIN
  WEBSITE
  RESUME
}

enum ContentOwnerType {
  EXPERIENCE
  EDUCATION
}

enum NodeKind {
  SUMMARY
  CONTENT
}

enum NodeType {
  PARAGRAPH
  NUMBERED_LIST
  BULLETED_LIST
}

enum TitleLayout {
  INLINE
  STACKED
}

model ContentNode {
  id          String   @id @default(uuid()) @db.Uuid
  createdAt   DateTime @default(now())
  createdBy   User     @relation("createdContentNodes", fields: [createdById], references: [id])
  createdById String   @db.Uuid
  updatedAt   DateTime @updatedAt
  updatedBy   User     @relation("updatedContentNodes", fields: [updatedById], references: [id])
  updatedById String   @db.Uuid

  slug        String
  title       String?
  content     String?
  order       Int
  titleLayout TitleLayout?
  kind        NodeKind
  // Null is equivalent to PARAGRAPH. Always null when kind is SUMMARY.
  type        NodeType?

  visible          Boolean              @default(true)
  excludedChannels SyndicationChannel[] @default([])

  // Polymorphic owner. No FK constraint is possible; see "Invariants" below.
  ownerId   String           @db.Uuid
  ownerType ContentOwnerType

  children NestedContentNode[] @relation("nestedContentNodes")
  skills   Skill[]             @relation("contentNodeSkills")

  @@unique([slug, ownerId, ownerType])
  @@index([ownerId, ownerType])
}

model NestedContentNode {
  id          String   @id @default(uuid()) @db.Uuid
  createdAt   DateTime @default(now())
  createdBy   User     @relation("createdNestedContentNodes", fields: [createdById], references: [id])
  createdById String   @db.Uuid
  updatedAt   DateTime @updatedAt
  updatedBy   User     @relation("updatedNestedContentNodes", fields: [updatedById], references: [id])
  updatedById String   @db.Uuid

  slug        String
  title       String?
  content     String?
  order       Int
  titleLayout TitleLayout?

  visible          Boolean              @default(true)
  excludedChannels SyndicationChannel[] @default([])

  // A real, non-null FK. This is what caps depth at two.
  parent   ContentNode @relation("nestedContentNodes", fields: [parentId], references: [id], onDelete: Cascade)
  parentId String      @db.Uuid

  skills Skill[] @relation("nestedContentNodeSkills")

  @@unique([slug, parentId])
  @@index([parentId])
}
```

Additions required on models that already exist in `nick.florin`:

```prisma
model Experience {
  // ...existing fields, including `visible Boolean @default(true)`...
  excludedChannels SyndicationChannel[] @default([])
}

model Education {
  // ...existing fields, including `visible Boolean @default(true)`...
  excludedChannels SyndicationChannel[] @default([])
}

model Skill {
  // ...existing fields...
  contentNodes       ContentNode[]       @relation("contentNodeSkills")
  nestedContentNodes NestedContentNode[] @relation("nestedContentNodeSkills")
}

model User {
  // ...existing fields...
  createdContentNodes       ContentNode[]       @relation("createdContentNodes")
  updatedContentNodes       ContentNode[]       @relation("updatedContentNodes")
  createdNestedContentNodes NestedContentNode[] @relation("createdNestedContentNodes")
  updatedNestedContentNodes NestedContentNode[] @relation("updatedNestedContentNodes")
}
```

Note that `Experience` and `Education` need no `nodes` back-relation: the owner link is polymorphic,
so nodes are fetched by `ownerId` + `ownerType` rather than through a relation field.

---

## This is an evolution of `Detail`, not a new table

`nick.florin` already models this domain. **`ContentNode` and `NestedContentNode` should replace
`Detail` and `NestedDetail`, not sit beside them.** They are the same concept; the new model adds
syndication, ordering, and presentation.

| `Detail` / `NestedDetail`                 | `ContentNode` / `NestedContentNode`    | Migration                                        |
| ----------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `label`                                   | `title`                                | Rename. Nullable in the new model.               |
| `description`                             | `content`                              | Rename.                                          |
| `shortDescription`                        | — **unresolved, see below**            | Decide before migrating.                         |
| `entityId` / `entityType`                 | `ownerId` / `ownerType`                | Rename; `DetailEntityType` → `ContentOwnerType`. |
| `visible`                                 | `visible`                              | Unchanged.                                       |
| `detailId` (on NestedDetail)              | `parentId`                             | Rename.                                          |
| `project` / `projectId`                   | keep as-is                             | Not modeled here; this repo has no projects.     |
| `skills`                                  | `skills`                               | Unchanged, both levels.                          |
| —                                         | `slug`                                 | **New.** Backfill; see below.                    |
| —                                         | `order`                                | **New.** `Detail` has no ordering at all.        |
| —                                         | `kind`                                 | **New.** Existing rows are all `CONTENT`.        |
| —                                         | `type`, `titleLayout`                  | **New.** Null is the correct default for both.   |
| —                                         | `excludedChannels`                     | **New.** `[]` for existing rows.                 |
| `@@unique([label, entityId, entityType])` | `@@unique([slug, ownerId, ownerType])` | Requires slugs backfilled first.                 |

**Backfilling `order`:** `Detail` has no order column, so current ordering is whatever the query
returns. Assign from the intended display order at migration time; do not trust insertion order.

**Backfilling `slug`:** slugify `label` within each `(ownerId, ownerType)` group, de-duplicating
with a numeric suffix. Uniqueness is per parent, not global, so collisions across different roles
are fine and expected.

**`shortDescription` is unresolved.** It is effectively an existing channel-specific content
variant: a condensed version for tight spaces. Three options, in order of preference:

1. Fold it into the model as a per-channel content override (a small `ContentVariant` table keyed by
   node and channel). Most correct, most work.
2. Keep it as a second column on both node models. Cheapest, and honest about what it is.
3. Drop it and rely on separate nodes excluded from different channels. Simplest schema, but loses
   the "same point, said shorter" relationship.

Decide this before writing the migration; option 1 changes the shape of `ContentNode`.

---

## Invariants Postgres cannot enforce

These are real and must be held in application code and tests. They are the price of the shape; see
the rationale section for why each price was worth paying.

1. **The polymorphic owner has no foreign key.** Nothing stops a `ContentNode` pointing at an
   `ownerId` that does not exist, or at an `Experience` id while claiming `ownerType = EDUCATION`.
   Unavoidable with one content tree serving two owner types. Mitigate with a validation pass at
   write time and an integrity check in seed/CI.
2. **`type` must be null when `kind = SUMMARY`.** Summaries are always standalone prose. Enforceable
   with a Postgres `CHECK` in a hand-written migration if it proves worth it; not enforceable by
   Prisma.
3. **A `SUMMARY` node must have no children.** Same situation. `NestedContentNode` rows pointing at
   a summary parent are invalid.
4. **`content` is a single paragraph of HTML.** Multiple paragraphs in one row will render but break
   the per-paragraph syndication that justifies the whole model.
5. **`excludedChannels` should not repeat an ancestor's exclusions.** Harmless (the cascade AND-s
   anyway) but noise; a lint at write time keeps the data honest about intent.

Enforced structurally, and therefore NOT on this list: maximum depth of two, and "a list may only
contain paragraphs" (nested nodes carry no `type`, so they cannot be lists).

---

## The cascade

Specified here, implemented once in `src/lib/syndication.ts`. Nothing else may read `visible` or
`excludedChannels`.

A node is **eligible** for a channel when `visible === true` and the channel is not in
`excludedChannels`. Resolution is one post-order walk with two directions:

**1. Mask (top-down).** Effective eligibility is the node's own eligibility AND every ancestor's. A
descendant can never re-enable what an ancestor withheld.

**2. Prune (bottom-up).** A node that survived the mask is still dropped when rendering it would
produce a bare title: no `content` of its own AND no surviving children. Titles are a few bold words
and are meaningless alone. Because children resolve before parents, one post-order pass settles
this, including when pruning children empties the parent.

**The prune rule applies to nodes, not owners.** A role whose every content node is withheld from a
channel still has a company, title, and dates worth rendering, so resolution returns an owner with
empty `summary` and `content` rather than nothing. An owner disappears only when the owner itself is
ineligible.

Worked example, the real Craft "Architecture" section:

```
Role: craft
└── "Architecture"                            title, NO content, NUMBERED_LIST
    ├── "Server-Oriented Frontend Migration"    content
    ├── "Bundle Size & First Load"              content, excludes RESUME
    ├── "Monorepo & Microfrontend Decoupling"   content, excludes RESUME
    └── "Structured Logging & Observability"    content, excludes RESUME

RESUME  -> "Architecture" survives the mask, but only one child remains, so it renders with
           that one item. Had ALL four been withheld, "Architecture" would be pruned entirely.
WEBSITE -> renders with all four items.
```

**Consequence for querying:** eligibility is not a row predicate. `WHERE visible = true` is wrong;
answering "does this node appear on the resume" requires the ancestor chain and the descendant
subtree. Resolve in application code. At resume scale (hundreds of rows) denormalizing an effective
visibility column buys nothing and costs invalidation bugs.

---

## Migration plan

1. **Convert this repo's data first.** Rewrite `experience.ts` / `education.ts` onto `ContentInput`,
   render through `resolveSyndication`, and confirm the built PDF is unchanged. The model is not
   proven until it has held the real content.
2. **Settle `shortDescription`** (above). It is the only open question that changes the schema.
3. **Add the enums and the two models** to `nick.florin`, plus `excludedChannels` on `Experience`
   and `Education` and the back-relations on `Skill` and `User`.
4. **Migrate `Detail` → `ContentNode`** in one migration: rename columns, add the new ones, backfill
   `slug` and `order`, set `kind = CONTENT` on every existing row. Then `NestedDetail` →
   `NestedContentNode`.
5. **Promote summaries.** `Experience.description` and `Education.description` are today's summary
   prose as a single column. Split into `ContentNode` rows with `kind = SUMMARY`, one per paragraph,
   then drop the columns.
6. **Port the resolver** rather than reimplementing it, and port its behavior tests with it.

Steps 4 and 5 are destructive. Snapshot the database first.

---

## Why the shape is what it is

Each decision here had a live alternative that was rejected for a specific reason. Reversing one
without knowing the reason will reintroduce a problem that was already solved.

**Two concrete levels, not a self-recursive table.** A `parentId` on one table would remove the
duplicated field set, and was rejected because every constraint that matters becomes unenforceable:
maximum depth, "lists contain only paragraphs", and the root-versus-child invariant (roots carry
`ownerId`/`ownerType`, children carry `parentId`, and nothing would enforce exactly one). Unique
constraints degrade too: Postgres treats NULLs as distinct, so `@@unique([slug, parentId])` would
not constrain root rows at all without a hand-written partial index. Prisma also has no recursive
fetch, so reads become fixed-depth nested `include`s or raw CTEs. The duplication that was paid
instead is bounded — about eight columns written twice, erased in TypeScript by a shared base
interface — while the recursion cost would have been permanent, unbounded correctness risk.

**Revisit this if** depth 3 ever becomes real, or if syndication channels churn often enough that
"two migrations per channel" hurts. The enum-array choice below is what keeps that cost near zero.

**`Role` and `Degree` stay separate.** Merging them into one table with the differing fields made
optional was considered and rejected: they relate to _different_ entities (`Company` vs. `School`),
so a merged table needs two nullable FKs with nothing preventing both being set, and their natural
keys differ (`[title, companyId]` vs. `[major, schoolId]`), so no usable unique constraint exists.
Sharing the content tree does not require merging the owners — that is what the polymorphic
`ownerType` discriminator is for, and it belongs on the child pointing up, never as a `type` column
on a merged parent.

**Channels as an enum array, not one boolean column each.** Adding a channel — a tailored
per-application resume variant, say — is then a new enum value rather than a migration adding a
column to three tables. `@default([])` makes "published everywhere" the default, so new content
requires no syndication decision. This also matches `Skill`, which already uses
`SkillCategory[] @default([])` in `nick.florin`, so it is idiomatic there rather than novel.
Exclusions are modeled positively (a list of what to withhold) rather than as an inclusion list
precisely so that the empty default is the permissive one.

**Summaries are a `kind` on `ContentNode`, not a third model.** A separate `SummaryNode` would give
a type-level guarantee that summaries have no children and no type. It was rejected because it puts
a _third_ copy of the syndication field set in the schema, turning "add a channel" into three
migrations — the point where duplication stops being a bounded one-time cost and starts compounding.
The ordering requirement that motivated it (summaries sort as a set above content, not interleaved)
is fully served by the discriminator: sort by `(kind, order)`. The lost guarantee is cheap to
enforce in code and appears above as invariants 2 and 3.

**`visible` is a plain boolean, not the literal type `false`.** Typing it so only `false` could be
written was a neat authoring constraint, but Prisma generates `boolean` from `Boolean`, so the type
would change the moment it migrated — the first thing to break 1:1 alignment.
`visible Boolean @default(true)` is also already the convention on `Experience` and `Education`.
"Must be explicit" is an authoring preference, better served by lint than by the type system.

**`titleLayout` is nullable and derived at render.** Inside a list the default is `INLINE`,
otherwise `STACKED`. Persisting the resolved value would leave stale layouts behind whenever a
parent's `type` changed.

**Pagination is not in this model.** Which sheet a role lands on lives in `src/data/pages.ts`, which
is presentation, and it is meaningless for LinkedIn and the website. An earlier draft put a
`resumePage` field on the summary node; it was removed deliberately.

**Enum values are `SCREAMING_SNAKE`.** Prisma enum members are identifiers, and these strings become
those identifiers verbatim. Writing them in the final casing now means the migration is a copy.

**Audit columns are absent from the TypeScript model.** Every `nick.florin` model carries
`createdAt`/`createdBy`/`updatedAt`/`updatedBy`. They are pure database concerns with no meaning for
a statically built resume, so they appear in the target schema above but not in `content-model.ts`.
Add them at migration time; do not add them here.
