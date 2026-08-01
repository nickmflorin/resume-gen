# Nick Florin — Craft Education Portfolio & Interview Reference

- **Role:** Senior Software Engineer · Engineering Lead, Orangutan (OJL) Pod
- **Tenure:** Oct 15, 2024 – Jul 31, 2026 (~21.5 months)
- **Company:** Craft Education System (acquired by WGU, Western Governors University)
- **Product:** OJL Tracker — on-the-job learning tracking for apprenticeship and workforce programs
- **Repository:** `ce-software/craft` (pnpm + Nx monorepo)

---

## About this document

This is a **local record**, regenerated on 2026-08-01 directly from the `ce-software/craft`
repository and its GitHub history, because access to that repository (and to Slack, Notion, and
Datadog) is ending. It supersedes the earlier version of this file, which was written around April
2026 and is now substantially out of date: several things it described as _proposed_ or _deferred_
were subsequently built and shipped.

**Provenance of the claims below:**

- **Verified** items were derived from the repo: commit history, merged pull requests and their
  descriptions, files created, and documentation authored. Specific PR numbers are cited so a claim
  can be traced back if access is ever regained.
- **Carried over** items come from the previous version of this document and describe context the
  repository cannot show (team composition, business impact, Notion documents, verbal decisions).
  They are marked as such and were not independently confirmed.

Anything not marked "carried over" is traceable to the repository.

---

## Executive summary

Over ~21.5 months Nick was the engineering lead of the product pod owning OJL Tracker's
customer-facing surfaces, and simultaneously the primary driver of the monorepo's platform
architecture. The tenure divides into two overlapping arcs:

1. **Product feature ownership (Oct 2024 – Mar 2026).** End-to-end delivery of five major product
   surfaces — Rubrics, Target Ratings, Learner Cohorts, Time Tracking, and Observations/Skills —
   each taken from data model through GraphQL API, authorization, UI, tests, and rollout behind
   feature flags.
2. **Platform and architecture leadership (Dec 2024 – Jul 2026).** Extraction of the shared package
   layer that turned a single-product codebase into a multi-product monorepo, followed in 2026 by a
   sustained server-oriented frontend migration, a full Next.js 14→16 / React 18→19 / Auth0 v3→v4
   upgrade that closed a standing security advisory, and a bundle-size and first-paint performance
   program.

The second arc is where the last eight months went almost entirely, and it is the part least
represented in the previous version of this document.

---

## By the numbers (verified against the repository, 2026-08-01)

| Metric                          | Value                            |
| ------------------------------- | -------------------------------- |
| Commits authored on `main`      | **1,206**                        |
| Pull requests authored          | **1,255** (1,207 merged)         |
| Lines added / deleted           | **562,405 / 346,907**            |
| Unique files touched            | **16,002**                       |
| **PRs reviewed for teammates**  | **1,343**, across **34** authors |
| Test files created              | **678**                          |
| Workspace packages/apps created | **18**                           |
| Documentation pages authored    | **~65**                          |
| Active months                   | 22 (Oct 2024 – Jul 2026)         |

The review number is the one most worth remembering: **1,343 pull requests by 34 different
engineers**. It is the hardest evidence of the mentoring and technical-escalation role, and it is
larger than the number of PRs he authored himself.

---

## Major product features

### 1. Rubrics (Nov 2024 – Jun 2026, ~46 PRs)

Grading surface for instructors, evaluators, and admins to design, attach, and score configurable
rubrics. _(Carried over: became the most-used feature in the product.)_

Rebuilt from a partial implementation into a production system. The defining architectural move was
the **four-mode provider split** (PR "Splits `RubricProvider` into 4 Modes", 2024-12-20): the
original provider accumulated boolean flags that produced invisible, untestable state combinations,
and it was replaced with four explicit modes — view / edit / attach / score — each with a
well-defined valid state.

Also delivered: rubric preview, archival with friction/confirmation dialogs, criterion reordering
via a generalized sortable list, batch attach/detach against activities, rubric search in the select
dialog, whitespace-handling fixes in form fields, and a long tail of responsive and transition work.
The final fix in the arc (#6763, 2026-06-18) resolved an infinite render loop when opening the score
dialog.

**Talking points:** the four-mode split as an argument against boolean-flag providers; a target
ratings cache-invalidation bug that only manifested when a rubric was duplicated and reassigned,
requiring tracing cache identity across mutations.

### 2. Target Ratings (Dec 2024 – Aug 2025, ~21 PRs)

Multi-select target rating assignment with an average-score chip and side-by-side selected-vs-target
comparison. Notable for the **cancellable, batched update model** ("Cancellable, Batched Target
Ratings Updates w Reducer", 2024-12-26): simultaneous edits across multiple criteria are staged in a
reducer and committed or discarded as one unit, rather than firing a mutation per interaction.
Shipped behind a feature flag from the start (2024-12-13).

### 3. Learner Cohorts (Apr 2025 – Jun 2026, ~77 PRs)

Tenant-aware membership and access-control system gating content, assessments, and activity
visibility across nested customer cohorts. The largest single feature by PR count.

Built in a disciplined bottom-up order that is worth describing in interviews: data model first
(2025-04-02), then mutations, then queries, then query/mutation hooks, then page and table stubs,
then live data, then bulk actions, then empty and success states, then tests, then responsive
polish. Includes cohort favoriting wired into the side tree navigation, facilitator and instructor
assignment, archival with friction dialogs, bulk operations across both active and archived tables,
and cascade-delete semantics on user foreign keys.

A later pass (Dec 2025 – Feb 2026) introduced **"collapsed" queries and mutations** — consolidated
query documents that reduce round trips and N+1 fetching when loading cohort membership — and
integrated instructors into the cohorts page.

### 4. Time Tracking (Sep 2025 – May 2026, ~62 PRs)

Activity-logging and approval workflow for learners, instructors, evaluators, and admins, with
program-specific validation and submit-on-behalf-of flows.

Delivered the full stack: `ProgramTimeEntry` models and date-key classes, configuration mutations
and schemas, submission/approval/return mutations, learner and pending-approval queries, the
submission provider and form UI, collapsible tiles, learner metrics models and views, a
pending-approvals list with counts per tab, and a learner home-page widget.

Two design points worth raising in interviews:

- **Program-level configuration without per-customer forks.** Entry cadence (daily vs. monthly),
  minimum time per activity, whether learners may log above target, and similar constraints are
  exposed as program configuration, so customer-specific behavior required no engineering changes.
- **Substantial vs. non-substantial updates.** Whether an edit requires re-approval is enforced in
  the backend state machine, not the client — invalid transitions are rejected even if the client
  sends them (2025-11-13).

Covered by a dedicated Playwright end-to-end suite (2026-02-26) and extensive RTL tests. The
submit-on-behalf-of work (Feb 2026) required layered authorization: confirm the submitter holds the
evaluator role _and_ is assigned to the learner's program (#6292, and the urgent evaluator fix on
2026-02-26).

### 5. Observations & Skills (Dec 2025 – Apr 2026, ~39 PRs combined)

New product surface for defining skill taxonomies, attaching them to activities, and tracking
learner progress against real-world skill demonstrations in the field.

Built from nothing — no prior surface to reference. Admin multi-step configuration UI (skills
selection, category grouping, scoring method, custom fields), evaluator flow, pending-approvals
page, assigned-program view, submit-on-behalf-of, skill history drawer, locked-skills tab, and
integration into the cohorts drawer.

The **locked skills** implementation is the good story: the feature-flag gate had to be applied at
multiple query levels, because with the flag off, instructor queries broke on locked-skill lookups
and data could leak through indirect query paths (#fix on 2026-02-13).

### 6. CSV Onboarding & Edlink Integration (Jun 2025 – May 2026, ~69 PRs)

Bulk user onboarding via CSV, built as two reusable packages rather than page-level code:
`@craft/csv` (parsing, column mapping, validation, error classification) and `@craft/csv-ui` (the
multi-step upload dialog and the parsed-CSV table with inline validation errors).

Architecturally the most deliberate work in the codebase: base parser classes, a column-mapping
layer, an error-classification scheme, an options/preset model, and a **ports-and-adapters split**
separating parser implementations from the processors that drive them (2025-07-18). Several PRs are
explicitly labeled "0 logic change" — pure reorganization landed separately from behavior, which is
a reviewable-PR discipline worth citing.

Later reworked for **batched bulk writes** (#6480) and extended to the Edlink roster-integration
onboarding shape (#6483, #6484).

### 7. Pending Approvals _(carried over — Feb–Mar 2025)_

Unified inbox for instructors and evaluators: list view with toolbar, user filter, sorting, and
progressive loading; batch approve/return with selection state that handles mid-session invalidation
(an item becoming unapprovable because someone else acted on it); a focused evaluation dialog for
inline rubric scoring without navigation; and a home-page widget.

### 8. Industry/Occupations, ONET integration _(carried over — Mar–Apr 2025)_

ONET labor-market classification on programs: bulk CSV import script, Prisma models with phantom
type safety, resolvers, and autocomplete UI. _(Repo corroborates the import script, 2025-11-26.)_

---

## Platform architecture

### The package layer (Dec 2024 – Sep 2025)

Created **18 workspaces**, converting a single-product codebase into a monorepo capable of hosting
multiple products:

| Package                                           | Purpose                                                   |
| ------------------------------------------------- | --------------------------------------------------------- |
| `@craft/lib` (craft-library)                      | Shared utilities, graduated out of the app (2024-12-15)   |
| `@craft/database`                                 | Prisma client and generated model boundary (2025-01-03)   |
| `@craft/ui`                                       | The design system (2025-05-24)                            |
| `@craft/csv`, `@craft/csv-ui`                     | CSV parsing and its UI layer                              |
| `@craft/logging`                                  | Structured logging (2025-03-03)                           |
| `@craft/http`                                     | HTTP error-handling interface                             |
| `@craft/config`                                   | Shared configuration                                      |
| `@craft/environment`                              | Environment-variable handling, Next.js-aware (2025-06-04) |
| `@craft/testing`                                  | Shared test utilities                                     |
| `@craft/rollup`                                   | Shared build configuration                                |
| `@craft/tsconfig`                                 | Consolidated TS configs (2025-06-19)                      |
| `eslint-config-base/next/react`, `eslint-support` | Split lint configs per surface                            |
| `apps/docs`                                       | The internal documentation site                           |
| `apps/demographic-data`                           | Standalone data app                                       |

The design-system extraction was incremental and reviewable: forms, then types, then responsive
components, then datetime/status, then hooks, then trees, then layout components — each its own PR
over roughly a month.

### Server-oriented frontend migration (Dec 2025 – Jul 2026)

This is the headline architectural narrative, and it is worth understanding as one story rather than
a list of PRs.

**The starting condition.** The authenticated render path was a chain of **three render-blocking
client requests in strict sequential order**, each nested inside the previous: Auth0's `useUser`
hook, then a GraphQL user query against the Connect API, then Statsig feature-flag initialization
against Statsig's CDN. Until all three resolved, the app rendered nothing but a full-page loading
screen. Because `FeatureFlagProvider` gated the tree, Next.js pre-rendering and page caching could
not apply past that boundary at all.

**The migration**, in the order it landed:

1. **Auth to the server.** Post-login redirects and email verification moved server-side (#6613);
   the authenticated user is bootstrapped from a server-provided prop and the client Auth0 provider
   was dropped entirely (#6655); server auth props are funneled through a typed parameter to client
   providers (#6651). Auth0 session checks moved into edge middleware (#6346), with comprehensive
   coverage in an Edge-runtime Jest environment (#6319).
2. **Feature flags to the server** (#6719). Statsig moved from per-page client-side async
   initialization to a **server-side singleton initialized once at process boot** via the Next.js
   instrumentation hook. The server evaluates gates (so flag-gated pages redirect before any
   protected content ships) and produces a client bootstrap payload that the client SDK consumes
   **synchronously, with no network round trip**.
3. **Idle deferral** (#6660). Non-critical client work is deferred behind a browser-idle gate rather
   than competing with first paint.
4. **Provider architecture and SSR first paint** (#6985 → #6986 → #6987, a three-PR stack).
   Per-model providers for Program/Level/Plan/Activity with a full and a lightweight "core" variant,
   plus minimal "core" GraphQL queries; then the organization program pages seed those providers
   with a server-fetched model so the header, tree nav, and tables paint **real content on first
   paint**, with the heavier client query hydrating behind the already-painted UI.
5. **Continued page-by-page SSR**: assigned program pages (#6940), user profile pages (#6957),
   ThoughtSpot embeds (#6904), and the remaining pages migrated to a v2 layout (#6964).

**Outcomes stated in the PRs:** render-blocking requests on the critical path went from 3 to 0;
Statsig CDN requests went from 1 to 0 on initial client render and from per-page-load to once per
process boot; the full-page loading screen was eliminated for all non-LTI authenticated and public
pages except a transient stale-session reload; pre-rendering and the Next.js page cache became
applicable to these routes again; and users behind ad blockers or corporate firewalls that blocked
Statsig's CDN got a working app instead of a stalled one.

> **Important caveat on the "~60% TTI / ~50% LCP" figures.** These numbers appear in Nick's own
> notes but are **not substantiated anywhere in the repository**. PR #6719 includes a metrics table
> that is explicitly labeled _"directional estimates, not measured results … to be validated against
> Datadog RUM once deployed."_ The real before/after measurements lived in Datadog RUM dashboards,
> access to which has ended. Treat the percentages as recalled observations rather than citable
> measurements, and prefer the structural claims above (3 blocking requests → 0, loading screen
> eliminated, pre-rendering restored), which the repository does support.

### Next.js 16 / React 19 / Auth0 v4 upgrade (Jun 2026)

Delivered as a deliberately sequenced **three-PR stack** — a good example of decomposing a risky
migration:

1. **#6711 — preparation.** Everything that could land _before_ the version bumps: the v4
   environment schema (retaining legacy variable names mapped onto the v4 SDK's config, avoiding a
   sweeping rename across SSM parameters and GitHub variables), keeping the Management API surface
   alive through the upgrade, webpack warning suppression, and removal of dead test-database
   machinery.
2. **#6703 — Auth0 v3 → v4.** The "switch PR." Auth routes moved to middleware-mounted Edge-runtime
   handlers (v4 ships no API-route handlers); a `mergeAuthCookies()` helper preserves rolling
   session refresh on responses the middleware constructs itself, so session rotation is never
   silently dropped; a shared `Auth0Client` configured from validated environment rather than
   `process.env` discovery. Landed behind an `Auth0SdkVersion` toggle so the switch was reversible.
3. **#6704 — Next 14 → 16 (Turbopack) and React 18 → 19.** ~516 files: ~900 import conversions from
   the `@/` alias to Node `#` subpath imports that Turbopack resolves natively, ~90 explicit `JSX`
   type imports (React 19 removed the global namespace), ~40 `forwardRef` removals,
   `next.config.mjs` rewritten for Turbopack, `middleware.ts` renamed to `proxy.ts`, and a
   post-processing step on the generated Prisma client annotating its dynamic `fs`/`path` operations
   with `turbopackIgnore` to stop Turbopack tracing the entire repo into the standalone output.

**This closed the standing Next.js security advisory.** Note the correction to the older version of
this document: the CVE was _not_ ultimately deferred. The earlier assessment estimated 4–8
engineer-weeks and recommended risk acceptance; the remediation was subsequently planned and
executed, with the Auth0 v4 upgrade as its prerequisite.

### Bundle size and build performance (Jun 2026)

The bundle analysis that the previous document described as a _proposal_ was executed:

- **#6667 — `@craft/database` runtime leak.** The package's root entry used a runtime star export of
  the generated Prisma model, so even an apparently type-only import (`import { type AppUser }`)
  pulled the runtime barrel in, and in any Node/SSR graph that resolved to the engine-bearing build.
  Every page touching the package dragged the entire Prisma Client into its SSR bundle — the cause
  of the notorious repeated "Initializing prisma client" messages in local dev. Fixed by
  establishing a real type/runtime boundary.
- **#6661 — tree-shaking.** Barrel flattening via `optimizePackageImports` across internal packages
  and heavy third-party barrels (MUI DataGrid, date pickers, framer-motion), plus marking
  `@craft/database` `sideEffects: false`. Significant build-time improvement as well.
- **#6778 — nested-import tree-shaking in `@craft/ui`.** Subtle and worth telling: the _primary_
  import path was already tree-shaken correctly, but inside the shipped `dist`, each component
  re-imported its cross-group dependencies through the _other group's_ barrel, and Turbopack does
  not tree-shake nested re-export barrels. Importing one `Dialog` dragged in entire sibling
  component groups, cascading across the graph. Found using the Turbopack bundle analyzer that
  shipped with Next 16, and confirmed fixed with the same tool.
- Supporting work: debarreling the app's UI and hook directories (#6724, #6773), removing
  `lodash-es` from `@craft/lib` (#6666), lazy-loaded DataTable with skeleton (#6938, #6962), and
  separating library compile from deployable build in the Nx pipeline (#6814).

### Module boundaries and routing

- **ESLint-enforced module boundaries** in the app (#6665) — architecture enforced by tooling rather
  than convention.
- **Routing decoupled from the design system** (#6203): pages, routing, and path concepts pulled out
  of `@craft/ui`, then split again for edge-middleware usage (#6218), with page-exhaustiveness tests
  (#6234) and snapshot tests over page configuration (#6420).
- Program content pages restructured onto tabbed URLs with a shared nested layout (#6735, #6737) —
  URL-as-state rather than component state.

### Observability

`@craft/logging` (Mar 2025): a structured, namespaced JSON logging package rolled out across the
application, the notifications service, the SendGrid events app, the event emitter SDK,
`@craft/lib`, `@craft/ui`, `@craft/csv`, and the API tests, replacing ad-hoc `console.log`.
Motivated by a GraphQL authorizer logging blind spot that made staging auth failures very hard to
debug (revisited again in Dec 2025 to diagnose an evaluator bug).

Datadog work in 2026: eager initialization via server-injected page environment (#6997), session
replays attributed to the authenticated user (#6804), synthetic errors stopped from flooding error
logs (#6810), and removal of custom TTI instrumentation in favor of a served login landing document
(#6998).

### ThoughtSpot / reporting integration (Jul 2026)

Streaming and gzip-caching of proxied ThoughtSpot assets (#6902), pre-rendered embed with boot
deferred to idle (#6904), separation of ThoughtSpot and Metabase report pages (#6921), a **report
resolution engine** (#6934–#6936), and a file-download endpoint with activity-scoped permissions
(#6873, #6937).

---

## Security

**`docs/security/thoughtspot-embed-authorization-hardening.md`** — authored after an incident where
a browser back press revealed the ThoughtSpot home dashboard inside a report iframe. The document is
a strong artifact to reference, because it argues past the obvious fix:

> "Pre-render is the trigger, not the vulnerability."

The client can hide, conceal, or re-route the iframe, but none of that is a security boundary: the
iframe runs the full ThoughtSpot application proxied same-origin, so an authenticated user can reach
any route the embedded identity is authorized for regardless of what the UI does. The real boundary
is what the embedded identity is permitted to see. Two Craft-side mitigations were shipped (a
history-collapse guard injected into the proxied HTML, and a client reveal/conceal guard) while the
document records that the durable fix is identity-level authorization.

Also: hardened the GraphQL error response shape and removed `withApiAuthRequired` (#6307),
propagated real error codes instead of masking everything to Internal Server Error (#6965), and
moved page-level feature gating server-side so flag-gated content cannot briefly leak before the
client initializes (#6719).

---

## Developer experience and code quality

**The ESLint and TypeScript quality program (Oct 2024 – Jul 2026, ~76 PRs)** is one of the longest
continuous threads of the tenure, and the _grandfathering strategy_ is the transferable idea: adopt
a rule repo-wide as a warning with existing violations grandfathered, so new code is held to the
standard immediately while existing code migrates incrementally, then promote to error once the
backlog is cleared.

Rules adopted this way include `no-shadow`, `consistent-type-imports`, `no-unused-vars`,
`camelcase`, `max-len`, `object-shorthand`, `no-unsafe-enum-comparison`, `no-default-export`,
`jsx-filename-extension`, `no-non-null-optional-chain`, `no-unnecessary-condition`, and JSDoc rules.
**In June 2026 the loop closed: grandfathered rules were promoted to errors and the remaining
violations fixed (#6694), with a final cleanup pass in July (#6996).**

Supporting work: ESLint v9 + Prettier upgrade; splitting configs into base/react/next packages so
multiple UI apps could be supported; CSpell with automated ignore generation; YAML linting;
TypeScript checking enforced across test files in CI; repeated repair of the IDE/VS Code ESLint
integration; and monorepo IntelliSense performance tuning (#6289, #6536, #6947).

### Testing

678 test files created. Beyond volume, the notable investments are structural:

- **Failing RTL tests on unexpected console output** (#6607) and then eliminating all console noise
  from the app's RTL suite (#6758) — turning warnings into hard failures.
- **Edge-runtime Jest environment** for middleware coverage (#6319).
- **Snapshot testing** for the theme (#6032) and page configurations (#6420).
- Playwright suites for time tracking, auth (including Auth0 managed login), and mobile smoke flows;
  sustained work removing flake sources rather than retrying around them (#6513, #7010).

### Documentation (~65 pages authored)

Built Craft's internal documentation app (`apps/docs`, plus the earlier `docs/` site) from scratch —
Next.js + MDX, TOC navigation, cross-linking, custom code-block and workspace-link components, and
remark-based markdown linting.

Content authored spans: getting started and local development guides; contributing guides (code
review, committing, pull requests); React development guides (component design, code organization,
prop/state conventions, MUI usage); best practices (commenting, linting/formatting); a per-package
reference for all ten `@craft/*` packages; monorepo structure and "adding apps and packages" guides;
and technical reference material on environment variables, generated files, and logging.

The **`docs/performance/`** module (Jul 2026) is the strongest writing sample in the repository. It
explains how Datadog RUM computes `loading_time` and where its edge cases mislead; how Auth0 login
and logout redirect chains interact with browser navigation timing; and how the idle-deferral gate
interacts with every metric. Its central insight is that **a redirect chain is a single browser
navigation**, so the final document's `performance.timeOrigin` reaches back to the start of the
chain and every navigation-relative metric on the landing page inherits that offset — meaning the
login flow's design is itself a performance concern. The login flow was consequently restructured to
terminate in a served landing document that forwards client-side (starting a _fresh_ navigation)
rather than an HTTP redirect, at no additional round-trip cost. The logout-side gap is documented
with the exact remediation required, including the Auth0 tenant configuration change.

---

## Leadership and mentoring

**Verified:** 1,343 pull requests reviewed for **34 distinct teammates**, sustained across the full
tenure (371 in the first seven months, 582 in the next eight, 390 in the final seven). The four most
frequently reviewed colleagues received 191, 145, 117, and 109 reviews respectively — a depth that
indicates ongoing mentoring relationships rather than round-robin review assignment.

**Carried over (not independently verified):** Led the pod from a 2-engineer team with a PM and
rotating designer to a 5-engineer pod with a dedicated PM, serving as Engineering Lead throughout —
feature scoping, technical planning, sprint execution, and delivery. Acted as primary liaison
between Design/UX and Engineering, establishing structured handoff and feedback processes.
Spearheaded integration of Deque axe-core accessibility checks into CI/CD. Pod output was
instrumental in attracting enterprise accounts and qualifying the company for public-sector grants.
Later work included multi-step configurable evaluation workflows for a US Air Force use case.

---

## Interview question map

**"Walk me through a complex feature you owned."** → **Observations/Skills.** Built from nothing
with no prior surface to reference: taxonomy and progress-aggregation data model, GraphQL layer with
role-aware authorizers, multi-step admin configuration, evaluator flow, submit-on-behalf-of, locked
skills, cohort integration — delivered incrementally behind feature flags. The locked-skills gate is
the detail that shows depth: it had to be applied at multiple query levels because data leaked
through indirect paths when the flag was off.

**"Tell me about a time you improved performance."** → **The server-oriented migration.** Three
sequential render-blocking client requests (Auth0 → Connect API → Statsig CDN) gated every
authenticated page behind a full-screen loader and blocked Next.js pre-rendering entirely. Moving
auth and feature flags to the server, bootstrapping the client synchronously from a server-provided
payload, and seeding page providers with server-fetched models took the critical path to zero
blocking requests and restored pre-rendering. → **The `@craft/ui` nested-barrel bug (#6778)** is the
better _diagnostic_ story: the obvious import path was already tree-shaken; the leak was one level
deeper, inside the shipped `dist`, where components re-imported neighbours through sibling barrels
that Turbopack would not shake.

**"Tell me about an architectural decision you made."** → **The four-mode `RubricProvider` split.**
One provider with accumulating boolean flags produced invisible state combinations; four explicit
modes gave each context one valid state. → **Ports and adapters in `@craft/csv`**, separating parser
implementations from processors so new input shapes (Edlink rosters) plugged in without touching the
processing pipeline.

**"Tell me about a risky migration."** → **The Auth0 v4 / Next 16 three-PR stack.** Everything that
could land before the version bumps was landed first, so the upgrade PRs contained only the bumps
and their direct consequences; the SDK switch sat behind a version toggle so it was reversible; and
the whole thing closed a standing security advisory.

**"How do you raise quality on a team without blocking them?"** → **The ESLint grandfathering
strategy**, and the fact that it was carried to completion: rules adopted as warnings with existing
violations grandfathered, new code held immediately, backlog burned down incrementally, then
promoted to errors in June 2026.

**"Tell me about a security issue you handled."** → **The ThoughtSpot embed incident**, and
specifically the argument that the pre-render was the trigger and not the vulnerability — the client
cannot be a security boundary when the iframe hosts a full application proxied same-origin.

---

## Corrections to the previous version of this document

1. **The Next.js CVE was remediated, not deferred.** The earlier risk-acceptance assessment was
   superseded; Next 14→16 and Auth0 v3→v4 shipped in June 2026.
2. **The bundle analysis was executed, not just proposed.** All the major root causes it identified
   (the `@craft/database` runtime barrel leak, barrel fan-out, tree-shaking defeats) were fixed in
   #6661, #6667, and #6778.
3. **The auth/page-loading overhaul was executed, not just designed.** It became the server-oriented
   migration described above.
4. **Package count was understated.** The earlier document said four new packages; the repository
   shows 18 workspaces created.
5. **Commit and PR counts were understated.** ~1,030 commits and ~400 PRs became 1,206 commits and
   1,255 PRs, and the review count (1,343) was not previously recorded at all.
6. **The TTI/LCP percentages are not repo-substantiated.** See the caveat in the server-oriented
   migration section.
