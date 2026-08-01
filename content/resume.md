# Nick Florin

## Contact

- **Email:** nickmflorin@gmail.com
- **LinkedIn:** in/nick-florin-5046063b/
- **GitHub:** github.com/nickmflorin
- **Website:** www.nickflorin.com

## Summary

- 11 years of software engineering experience
- B.S. in Electrical Engineering - Rensselaer Polytechnic Institute
- M.S. in Financial Mathematics - The Johns Hopkins University

## About

A detail-obsessed, product-first engineer who takes deep psychological ownership of everything I
build. I do not close tickets - I internalize the product end-to-end, relentlessly surfacing
architectural gaps, raising engineering standards, and pushing the user experience forward at every
turn. Proactive by default: I propose the fix before being asked, carry features from ambiguous
scope to production polish, and mentor the engineers who ship alongside me. Proven track record of
leading cross-functional pods, delivering high-impact features, and elevating the engineering bar at
every stage of a company's growth.

## Skills

### Languages & Runtimes

| Skill        | Proficiency |
| ------------ | ----------- |
| Python       | Very High   |
| TypeScript   | Very High   |
| JavaScript   | Very High   |
| HTML5        | Very High   |
| CSS3         | Very High   |
| SASS / SCSS  | High        |
| SQL          | Proficient  |
| Node.js      | High        |
| Bash / Shell | Familiar    |
| Swift        | Proficient  |

### Frameworks & Libraries

| Skill                 | Proficiency |
| --------------------- | ----------- |
| React                 | Very High   |
| Django                | Very High   |
| Django REST Framework | Very High   |
| Flask                 | Very High   |
| Jest                  | Very High   |
| React Testing Library | Very High   |
| pytest                | High        |
| Next.js               | Very High   |
| GraphQL               | High        |
| Apollo GraphQL        | High        |
| Redux / Redux-Sagas   | High        |
| TailwindCSS           | High        |
| Prisma                | High        |
| tRPC                  | High        |
| d3.js                 | High        |
| Celery                | Proficient  |
| React Native          | Proficient  |

### Infrastructure & DevOps

| Skill                       | Proficiency |
| --------------------------- | ----------- |
| PostgreSQL                  | High        |
| Relational Databases        | High        |
| JWT / RSA-signed Token Auth | High        |
| AWS (EC2, S3, RDS, Amplify) | Proficient  |
| Docker & Docker Compose     | Proficient  |
| GitHub Actions              | Proficient  |
| Auth0                       | Proficient  |
| Vercel                      | Proficient  |
| GCP                         | Proficient  |
| Redis                       | Familiar    |

### Tooling, Build & Code Quality

- Monorepo Tooling & Build Orchestration (Nx, Turborepo, Lerna) - task graph design, affected-task
  resolution, remote build caching, and cross-project dependency management
- JavaScript Package Managers & Workspaces (pnpm workspaces, yarn workspaces, npm)
- Python Packaging & Environments (Poetry, pip, virtualenv)
- Python Test Orchestration (tox, coverage.py)
- Bundle Analysis & Frontend Performance Tooling (@next/bundle-analyzer, webpack-bundle-analyzer,
  source-map-explorer) - tree-shaking audits, barrel-export fan-out diagnosis, and First Load JS
  budgeting
- Linting & Formatting (ESLint incl. custom rule authoring, Prettier, Stylelint, pylint, flake8,
  black, isort)
- Type-Safety Enforcement (TypeScript strict mode, mypy, typed schema validation with Zod)
- Git Hooks & Commit Hygiene (Husky, lint-staged, Commitlint / Conventional Commits)
- Dependency Management & Automation (Dependabot, Renovate, npm-check-updates)
- CI/CD Pipeline Design & Automation (GitHub Actions, CircleCI) - matrix jobs, caching strategies,
  reusable workflows, and Nx-aware affected-only pipelines
- Testing Strategy Design across layers - Unit (Jest, vitest, pytest), Integration (React Testing
  Library, pytest), End-to-End (Playwright, Cypress), and Visual Regression (Storybook, Chromatic)
- Coverage Reporting (Codecov, coverage.py)
- TypeScript Type-System Design (authored an OSS utility library for type-safe literal enums)

### Architectural & Design Patterns

- Service-Oriented Architecture (SOA)
- Microservices & Microfrontend Architecture
- Monorepo Architecture & Tooling (Nx, Lerna)
- Server-Oriented Frontend Architecture (SSR, React Server Components)
- Domain-Driven Design & Domain Modeling
- REST, GraphQL & tRPC API Design
- Authentication & Authorization Patterns (RBAC, Multi-tenant Isolation, Policy-based Access
  Control)
- State Management Patterns (Redux, Redux-Sagas, Context Providers, Finite State Machines,
  Reducer-driven Wizards)
- Component Architecture & Design Systems
- CI/CD Pipeline Design & Automation
- Accessibility Compliance (WCAG, ARIA, axe-core / Deque)
- Performance Engineering (Bundle Analysis, Tree-shaking, TTI / LCP Optimization, SSR Caching)
- Structured Logging & Observability (Datadog, Sentry)
- Error Handling, Monitoring & Alerting
- Responsive & Adaptive Design

## Experience

### Senior Software Engineer - Craft Education System

**Oct 2024 - Present** | Remote

Engineering Lead of a cross-functional product pod, responsible for leading the development of
large, customer-facing features. Played a central role in the company's architectural evolution
following its acquisition by WGU (Western Governors University), driving the transition from a
single-product engineering organization - operating out of a single product codebase - to an
enterprise-grade, multi-product platform organized as a unified monorepo. Championed the underlying
monorepo strategy and Nx adoption as the structural foundation for that transition, establishing
shared tooling, independent product surfaces, and scalable team ownership within one cohesive
engineering platform.

Operated consistently above title - writing code, authoring architectural specs, producing technical
analyses, and unblocking teammates across the engineering organization.

The pod's output was directly instrumental in attracting and onboarding new enterprise customer
accounts and qualifying the company for several public-sector grants.

#### Leadership

Built and led a cross-functional product pod from the ground up - starting as a 2-engineer team
alongside a PM and rotating designer, then expanding after three months into a 5-engineer pod with a
dedicated PM. Served as Engineering Lead throughout, owning feature scoping, technical planning,
sprint execution, architecture and feature delivery end-to-end. Features delivered include:

1. **Segmented Learner Cohorts** A tenant-aware membership and access-control system that lets
   enterprise customers organize learners into nested cohorts - by program, term, institution, or
   custom grouping - and gates content, assessments, and activity visibility along those boundaries.
   Led architectural decision-making end-to-end: evaluated flat role-map, ACL, and policy-based
   approaches against the customer's multi-institution hierarchy, then landed on a policy-based
   authorization layer with hierarchical permission scoping across users, cohorts, and
   organizations, and modeled cohort membership as a composable relationship graph rather than a
   flat role map - opening the door to nested permission inheritance and future cross-organizational
   sharing. Introduced a tenant-aware data-segmentation pattern enabling multi-dimensional access
   control without leaking query complexity into the application layer. Coordinated the pod by
   partitioning the work along surface area - backend modeling and policy primitives, API and query
   integration, frontend membership UIs, and admin tooling - authoring the policy-layer spec myself
   so downstream work could start in parallel and running biweekly design reviews to keep interfaces
   stable as the surfaces came together.

2. **Rubrics** The grading and evaluation surface used by instructors, evaluators, and admins to
   design, attach, and score configurable rubrics against learner work - now the most-used feature
   across all customer accounts. Led the architectural redesign after the original implementation
   accumulated a class of state-management bugs that couldn't be patched incrementally - driving
   alignment across product, design, and engineering on a four-mode provider pattern
   (view/edit/attach/preview) backed by a finite-state-machine context model, and a composable,
   schema-driven form architecture that unified instructor, evaluator, and admin surfaces behind a
   single rendering pipeline. This kept domain logic out of the view layer and made every mode
   independently testable. Coordinated the pod by carving delivery into independent vertical slices
   - the state machine and provider core, the form schema and rendering layer, the per-mode UIs, and
     migration of existing rubric data - so each engineer could own a slice end-to-end. Ran paired
     design/architecture sessions with the product designer to validate every mode against real
     instructor workflows before implementation began.

3. **Time Tracking** An activity-logging and approval workflow that lets learners record time
   against learning activities and lets instructors, supervisors, and administrators review, adjust,
   submit-on-behalf-of, and approve those entries - with program-specific validation rules and
   signoff requirements. Led architectural decision-making on how to keep the workflow extensible
   without forking logic per customer: modeled the approval workflow as a state machine with
   pluggable validation rules and declarative activity-requirement configuration, enabling new
   workflow variants to be composed from shared primitives rather than forked. Introduced an
   actor-delegation layer to cleanly represent submit-on-behalf-of flows without entangling
   authorization with business logic, and separated domain, validation, and presentation concerns
   into three cleanly-bounded layers so three engineers could work in parallel without colliding.
   Ran weekly architecture syncs where each engineer walked the pod through their layer's contract
   before merging, and drove the test strategy - backing the full workflow with Playwright
   end-to-end coverage to lock in behavior across the expanding matrix of program variants.

4. **Skills Tracking** A major new product surface that lets admins define custom skill taxonomies,
   attach them to learning activities and assessments, and track learner progress against them over
   time - with evaluation surfaces for instructors, supervisors, and other permitted roles. Led
   end-to-end development from product discovery through rollout: ran the technical scoping sessions
   with product and design, authored the skill-taxonomy and progress-aggregation data model, and
   decided the boundary between platform-level primitives and per-customer skill definitions so the
   feature could be reused across future products on the monorepo. Coordinated the pod by sequencing
   work into dependency-ordered phases - taxonomy modeling and admin definition UI first, then
   activity attachment, then learner-facing progress and evaluation surfaces - pairing a senior
   engineer with each junior engineer to accelerate onboarding onto a domain none of them had worked
   in before, and personally unblocking the cross-cutting pieces (authorization, activity-model
   integration, reporting) so each pair could stay heads-down on their slice.

#### Mentoring

Invested heavily in the growth of junior and mid-level engineers through structured PR reviews, pair
programming, and 1:1 mentoring focused on TypeScript, React, Next.js, and GraphQL. Acted as a
consistent technical resource and escalation point for the broader engineering organization.

#### Architecture

Identified, scoped, and drove the implementation of a series of architectural initiatives that
reshaped the platform. For each initiative, I surfaced the underlying issue, authored the
remediation plan, sequenced implementation, coordinated with product to communicate impact and
rollout to users, and then executed on delivery alongside the team:

1. **Server-Oriented Frontend Architecture** Identified a major performance, security, and
   maintainability ceiling imposed by a client-heavy waterfall rendering model and application
   architecture that prevented NextJS's server-side caching and rendering benefits from not being
   fully realized. Planned and executed the migration to a server-oriented frontend architecture,
   bootstrapping authentication, user context, and configuration on the server to unlock page-level
   SSR caching and pre-rendering. The shift reduced average TTI by ~60% and LCP by ~50% on
   high-traffic pages, dramatically accelerated both initial server-side page loads and subsequent
   client-side navigation, hardened the auth surface by resolving sessions server-side, and improved
   the fidelity of our own TTI telemetry as a downstream benefit, directly lifting user-perceived
   performance and engagement across the product.

2. **Bundle Size & First Load Performance** Diagnosed the architectural root causes behind a bloated
   shared bundle and First Load JS payload: barrel-export fan-out across dozens of modules, a large
   generated GraphQL document, a non-lazy provider cascade, and a shared UI package whose exports
   map silently pointed to CJS output - defeating tree-shaking across every downstream consumer.
   Authored the remediation plan, coordinated rollout with product, and incrementally shipped the
   changes, meaningfully reducing shared bundle size across the product.

3. **Monorepo & Microfrontend Decoupling** Led the decoupling of the frontend codebase into
   business-logic and presentation-layer modules, establishing clean microfrontend boundaries that
   improved maintainability and enabled parallel team development. Championed Nx adoption to support
   the company's expansion from a single-product codebase to a scalable mesh-style architecture
   supporting multiple independent products, each with improved dependency resolution, remote build
   caching, and affected-task orchestration.

4. **Structured Logging & Observability** Designed and rolled out a unified, namespaced
   structured-logging architecture spanning every service on the platform. Replaced scattered ad-hoc
   logging with a single queryable observability surface wired into Datadog and Sentry, giving the
   team rich, contextual telemetry across the application, notification pipelines, and shared
   libraries - and a durable foundation for future monitoring and alerting.

#### Design & UX Coordination

Served as a liaison between Design/UX and Engineering - establishing structured handoff and feedback
processes that reduced ambiguity, shortened iteration cycles, and produced measurably better user
experiences. Spearheaded integration of Deque axe-core accessibility checks directly into CI/CD
pipelines, establishing automated WCAG enforcement across all product surfaces.

#### Developer Experience, Testing & Code Quality

Drove broad improvements to developer tooling, CI/CD pipelines, and internal workflows - reducing
onboarding friction and build inconsistency across the team. Championed Nx for build orchestration
and overhauled the testing strategy across unit, integration, and end-to-end layers (Jest, React
Testing Library, Playwright) - dramatically improving test coverage, reliability, and
maintainability.

Established a monorepo-wide code-quality program - instituting a comprehensive linting, type-safety,
and style ruleset paired with a more rigorous code-review process to ensure consistency and
maintainability across the codebase. Rolled it out via a grandfathering strategy that kept new code
clean while allowing incremental migration of the existing codebase. Enforced type-checking across
test files in CI, repaired long-broken IDE lint integration, and authored an internal
developer-documentation app covering contributing guides, environment setup, React patterns, and
architectural decisions.

#### Security

Led the response to a Next.js CVE surfaced through the company's security posture review. Assessed
exposure end-to-end, authored the risk analysis and remediation plan, coordinated with leadership on
timeline and trade-offs against an Auth0-coupled upgrade path, and executed the resulting hardening
across the platform - closing the vulnerability with minimal customer-facing disruption.

---

### Senior Software Engineer - Northbeam

**Jul 2023 - Jun 2024** | Remote

Contributed to the ongoing development of Northbeam's flagship marketing analytics platform across
web and mobile surfaces.

**Multi-Currency Analytics** - Designed and implemented a currency localization system that allowed
all marketing analytics to be denominated in a user-configurable currency, directly expanding the
platform's addressable market to international customers.

**Component Library** - Architected a well-tested, flexible internal component library built on
React, SASS, and TailwindCSS. Enabled significantly faster feature development, reduced UI
inconsistency across the product, and made design-scope changes far easier to absorb throughout the
codebase.

---

### Founding Engineer - ShelfCycle

**Apr 2023 - Aug 2023** | Washington, DC

Contributed to early MVP development of a web-based inventory management, order management, and
accounting platform for the chemical supply chain industry. Organized Agile workflows, led team
meetings, and mentored engineers less familiar with the stack - built on Next.js, TRPC, Prisma, and
Vercel.

---

### Software Engineer - Corsha

**Jun 2022 - Mar 2023** | Vienna, VA

Team lead for the "Corsha Console" - a modern customer-facing web platform enabling customers to
manage, monitor, and configure proprietary network security technology. Owned the product roadmap
from initial planning through delivery: scoped the system architecture, established Agile workflows,
coordinated with an external UI/UX design firm on the full UX and user flow, and led the engineering
team through implementation. Maintained high code quality standards through rigorous PR review and
active mentoring of less experienced engineers.

---

### Co-Founder & Creator - GreenBudget

**Feb 2021 - May 2022** | Remote

Architected and led development of GreenBudget - a real-time, multi-user collaborative budgeting and
payroll platform for the film production industry, addressing a significant gap where producers
relied on cumbersome spreadsheets and outdated tools. Launched in February 2022; by May 2022, the
platform had grown to over 1,000 users with approximately 40–50% on paid subscriptions, and had been
adopted by several film studios for beta testing.

---

### Technical Lead - Nirveda Cognition

**Sep 2020 - Mar 2021** | Remote

Responsible for the full consumer-facing product: infrastructure architecture, feature development,
and technical leadership of a small engineering team. Managed task allocation, conducted all code
reviews, and led feature initiatives from planning through delivery. Spearheaded an automated
testing and CI/CD initiative that increased test coverage by approximately 70%.

---

### Full Stack Software Developer - Saracen Energy

**Apr 2020 - Sep 2020** | Arlington, VA

Developed front-end and back-end analytical tooling used by the trading desk to inform investment
decisions, bridging the gap between the quantitative analysis and software development teams.

---

### Platform Developer - The Atlantic

**Apr 2018 - Apr 2020** | Washington, DC

Backend Python developer supporting The Atlantic's CMS, subscriptions, and digital products.
Designed and implemented the Apple News syndication pipeline, opening a new digital distribution
channel and directly contributing an additional revenue stream for the company.

---

### Quantitative Analyst, Investment Analytics & Data - The Rock Creek Group

**Jul 2016 - Apr 2018** | Washington, DC

Built internal analytical tooling and data infrastructure supporting investment decision-making at a
multi-billion dollar asset management firm. Regularly bridged quantitative analysis and software
development teams - formalizing and automating previously manual analytical workflows through
Python-based tooling. This role marks the foundation of my professional software engineering
practice, where Python expertise was developed through applied use at scale.

---

### Quantitative Research Analyst - PI Analytics

**Apr 2015 - Jul 2016** | Olney, MD

Researched and implemented complex models for credit default risk across exotic derivatives and
structured products, using Python for numerical computation and Monte Carlo simulation.

## Education

### M.S. in Computational Mathematics - The Johns Hopkins University

**Jan 2016 - Postponed** | Baltimore, MD | GPA: 3.70/4.00

Ongoing coursework toward an additional degree, temporarily postponed.

### M.S. in Engineering; Financial Mathematics - The Johns Hopkins University

**Aug 2014 - Jan 2016** | Baltimore, MD | GPA: 3.85/4.00

Advanced coursework in Applied Mathematics, Statistics & Numerical Computation.

### B.S. in Electrical Engineering - Rensselaer Polytechnic Institute

**Aug 2010 - May 2014** | Troy, NY | GPA: 3.50/4.00

Minor in Economics, Concentration in Robotics & Control Systems.
