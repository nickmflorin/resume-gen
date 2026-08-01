import type { Role } from './types';

/**
 * Every role, newest first. Which sheet a role lands on is decided in `pages.ts`, not here, so
 * reordering or rebalancing pages never touches this file.
 */
export const ROLES: Role[] = [
  {
    key: 'craft',
    company: 'Craft Education System',
    logo: 'Craft.svg',
    title: 'Senior Software Engineer',
    dates: 'Oct 2024 - Present',
    location: 'Remote',
    summary: [
      `Engineering Lead of a cross-functional product pod, responsible for leading the development
       of large, customer-facing features. Played a central role in the company's architectural
       evolution following its acquisition by WGU (Western Governors University), driving the
       transition from a single-product engineering organization - operating out of one product
       codebase - to an enterprise-grade, multi-product platform organized as a unified monorepo.
       Championed the underlying monorepo strategy and Nx adoption as the structural foundation for
       that transition, establishing shared tooling, independent product surfaces, and scalable
       team ownership within one cohesive engineering platform.`,
      `Operated consistently above title - writing code, authoring architectural specs, producing
       technical analyses, and unblocking teammates across the engineering organization.`,
      `The pod's output was directly instrumental in attracting and onboarding new enterprise
       accounts and qualifying the company for several public-sector grants.`,
    ],
    sections: [
      {
        heading: 'Leadership',
        body: [
          `Led a cross-functional pod from the ground up, starting as a 2-engineer team alongside a
           PM and rotating designer, then expanding into a 5-engineer pod with a dedicated PM.
           Served as Engineering Lead throughout, owning feature scoping, technical planning, sprint
           execution, and delivery end-to-end.`,
        ],
        items: [
          `<strong>Segmented Learner Cohorts</strong> - Tenant-aware membership and access-control
           system gating content, assessments, and activity visibility across nested customer
           cohorts. Drove the architectural call: landed on policy-based authorization with
           hierarchical permission scoping and modeled cohort membership as a composable
           relationship graph - enabling nested inheritance and cross-organizational sharing.`,
          `<strong>Rubrics</strong> - Grading surface for instructors, evaluators, and admins to
           design, attach, and score configurable rubrics; now the most-used feature in the product.
           Led the redesign after the original implementation accumulated unfixable state-management
           bugs - aligning product, design, and engineering on a four-mode provider pattern
           (view/edit/attach/score) and a schema-driven form architecture unifying every surface
           behind one rendering pipeline.`,
          `<strong>Time Tracking</strong> - Activity-logging and approval workflow for learners,
           instructors, evaluators, and admins, with program-specific validation and
           submit-on-behalf-of flows. Kept it extensible without per-customer forks: modeled
           approval as a state machine with pluggable rules. Exposed program-level configuration so
           instructors and admins could tailor how learners tracked time - daily vs. monthly entry
           cadence, minimum time per activity, whether learners could log above the target, and
           other per-program constraints - without requiring engineering changes.`,
          `<strong>Skills Tracking</strong> - New product surface for defining skill taxonomies,
           attaching them to activities, and tracking learner progress. Led end-to-end from
           discovery through rollout: authored the taxonomy and progress-aggregation data model, and
           drew the platform/per-customer boundary so the feature could be reused across future
           products on the monorepo. Organized and planned the work based on dependencies to
           maximize parallel efforts across multiple engineers.`,
        ],
      },
      {
        heading: 'Architecture',
        items: [
          `<strong>Server-Oriented Frontend Migration</strong> - Led the shift from a client-heavy
           waterfall rendering model to a server-oriented architecture, bootstrapping client-side
           service providers on the server to unlock SSR caching and page-level prerendering.
           Reduced average TTI ~60% and LCP ~50% on high-traffic pages.`,
          `<strong>Bundle Size &amp; First Load Performance</strong> - Diagnosed the root causes
           behind a bloated shared bundle - barrel-export fan-out, a large generated GraphQL
           document, a non-lazy provider cascade, and a UI package exports map silently pointing to
           CJS output that defeated tree-shaking downstream. Authored the remediation plan and
           shipped the fixes incrementally.`,
          `<strong>Monorepo &amp; Microfrontend Decoupling</strong> - Decoupled the frontend into
           business-logic and presentation-layer modules with clean microfrontend boundaries, and
           drove Nx monorepo adoption to support the company's expansion from a single-product
           codebase to a scalable, multi-product mesh.`,
          `<strong>Structured Logging &amp; Observability</strong> - Designed and rolled out a
           unified, namespaced structured-logging architecture spanning every service - replacing
           scattered ad-hoc logging with a single queryable observability surface wired into
           Datadog.`,
        ],
      },
      {
        heading: 'Mentoring',
        body: [
          `Invested heavily in the growth of junior and mid-level engineers through structured PR
           reviews, pair programming, and 1:1 mentoring focused on TypeScript, React, Next.js, and
           GraphQL. Acted as a consistent technical resource and escalation point for the broader
           engineering organization.`,
        ],
      },
      {
        heading: 'Design & UX Coordination',
        body: [
          `Primary liaison between Design/UX and Engineering; established structured handoff and
           feedback processes that reduced ambiguity, shortened iteration cycles, and produced
           measurably better user experiences. Spearheaded integration of Deque axe-core
           accessibility checks into CI/CD pipelines for automated WCAG enforcement.`,
        ],
      },
      {
        heading: 'Developer Experience & Code Quality',
        body: [
          `Established a monorepo-wide TypeScript and ESLint quality program, systematically
           adopting 20+ rules via a grandfathering strategy that kept new code clean while enabling
           incremental migration. Enforced type-checking across test files in CI, fixed long-broken
           IDE ESLint integration, and created an internal documentation app covering contributing
           guides, React patterns, and architectural decisions.`,
        ],
      },
    ],
    pills: [
      'TypeScript',
      'React',
      'Next.js',
      'GraphQL',
      'Apollo Server',
      'Prisma',
      'PostgreSQL',
      'Nx Monorepo',
      'Microfrontends',
      'SSR',
      'Performance Engineering',
      'Accessibility (axe-core)',
      'Datadog',
      'Playwright',
      'GitHub Actions',
      'AWS',
      'CI/CD',
    ],
  },
  {
    key: 'northbeam',
    company: 'Northbeam',
    logo: 'NorthBeam.svg',
    title: 'Senior Software Engineer',
    dates: 'Jul 2023 - Jun 2024',
    location: 'Remote',
    summary: [
      `Contributed to the ongoing development of Northbeam's flagship marketing analytics platform
       across web and mobile surfaces.`,
    ],
    sections: [
      {
        heading: 'Multi-Currency Analytics',
        body: [
          `Designed and implemented a currency localization system enabling all marketing analytics
           to be denominated in a user-configurable currency, directly expanding the platform's
           addressable market to international customers.`,
        ],
      },
      {
        heading: 'Component Library',
        body: [
          `Architected a well-tested, flexible internal component library built on React, SASS, and
           TailwindCSS. Enabled significantly faster feature development, reduced UI inconsistency
           across the product, and made design-scope changes far easier to absorb throughout the
           codebase.`,
        ],
      },
    ],
    pills: [
      'React',
      'TypeScript',
      'GraphQL',
      'TailwindCSS',
      'SASS',
      'React Native',
      'GCP',
      'Storybook',
      'Component Development',
      'Responsive Design',
      'lerna',
    ],
  },
  {
    key: 'shelfcycle',
    company: 'ShelfCycle',
    logo: 'ShelfCycle.svg',
    title: 'Founding Engineer',
    dates: 'Apr 2023 - Aug 2023',
    location: 'Washington, DC',
    summary: [
      `Contributed to early MVP development of a web-based inventory management, order management,
       and accounting platform for the chemical supply chain industry. Organized Agile workflows,
       led team meetings, and mentored engineers less familiar with the stack built on Next.js,
       TRPC, Prisma, and Vercel.`,
    ],
    pills: ['Next.js', 'TRPC', 'React', 'Prisma', 'Vercel', 'TypeScript', 'SSR'],
  },
  {
    key: 'corsha',
    company: 'Corsha',
    logo: 'Corsha.svg',
    title: 'Software Engineer',
    dates: 'Jun 2022 - Mar 2023',
    location: 'Vienna, VA',
    summary: [
      `Team lead for the "Corsha Console," a modern customer-facing web platform enabling customers
       to manage, monitor, and configure proprietary network security technology. Owned the product
       roadmap from initial planning through delivery: scoped the system architecture, established
       Agile workflows, coordinated with an external UI/UX design firm on the full UX and user flow,
       and led the engineering team through implementation. Maintained high code quality through
       rigorous PR review and active mentoring of less experienced engineers.`,
    ],
    pills: [
      'Next.js',
      'TypeScript',
      'React',
      'SCSS',
      'Prisma',
      'PostgreSQL',
      'Node.js',
      'Docker',
      'Jenkins',
      'SonarQube',
      'Jest',
      'Storybook',
      'Accessibility',
      'CI/CD',
    ],
  },
  {
    key: 'greenbudget',
    company: 'GreenBudget',
    logo: 'GreenBudget.svg',
    title: 'Co-Founder & Creator',
    dates: 'Feb 2021 - May 2022',
    location: 'Remote',
    summary: [
      `Architected and led development of GreenBudget, a real-time, multi-user collaborative
       budgeting and payroll platform for the film production industry, addressing a gap where
       producers relied on cumbersome spreadsheets and outdated tools. Launched February 2022; by
       May 2022, the platform had grown to over 1,000 users with approximately 40-50% on paid
       subscriptions and had been adopted by several film studios for beta testing (now operating as
       Saturation at saturation.io).`,
    ],
    sections: [
      {
        heading: 'Testing & CI/CD',
        body: [
          `Spearheaded a comprehensive automated testing suite and CI/CD integration that increased
           test coverage by approximately 70%, meaningfully improving platform stability and release
           confidence.`,
        ],
      },
    ],
    pills: [
      'Python',
      'Django REST Framework',
      'React',
      'Redux-Sagas',
      'TypeScript',
      'PostgreSQL',
      'Redis',
      'Celery',
      'AWS S3 / EC2',
      'CircleCI',
      'Docker',
      'pytest',
      'WebSockets',
      'Django Channels',
    ],
  },
  {
    key: 'nirveda',
    company: 'Nirveda Cognition',
    logo: 'Nirveda.svg',
    title: 'Technical Lead',
    dates: 'Sep 2020 - Mar 2021',
    location: 'Remote',
    summary: [
      `Responsible for the full consumer-facing product: infrastructure architecture, feature
       development, and technical leadership of a small engineering team. Managed task allocation,
       conducted all code reviews, and led feature initiatives from planning through delivery.
       Spearheaded an automated testing and CI/CD initiative that increased test coverage by
       approximately 70%.`,
    ],
    pills: [
      'Python',
      'Django REST Framework',
      'React',
      'Redux-Sagas',
      'TypeScript',
      'Auth0',
      'PostgreSQL',
      'Celery',
      'AWS',
      'Docker',
      'Jenkins',
    ],
  },
  {
    key: 'saracen',
    company: 'Saracen Energy',
    logo: 'Saracen.svg',
    title: 'Full Stack Software Developer',
    dates: 'Apr 2020 - Sep 2020',
    location: 'Arlington, VA',
    summary: [
      `Developed front-end and back-end analytical tooling used by the trading desk to inform
       investment decisions, bridging the gap between quantitative analysis and software development
       teams.`,
    ],
    pills: [
      'Python',
      'Flask',
      'React',
      'React-Redux',
      'TypeScript',
      'Redux-Sagas',
      'Docker',
      'Jenkins',
      'pytest',
      'PostgreSQL',
      'RabbitMQ',
      'ElasticSearch',
      'SQLAlchemy',
    ],
  },
  {
    key: 'atlantic',
    company: 'The Atlantic',
    logo: 'TheAtlantic.png',
    title: 'Platform Developer',
    dates: 'Apr 2018 - Apr 2020',
    location: 'Washington, DC',
    summary: [
      `Backend Python developer supporting The Atlantic's CMS, subscriptions, and digital products.
       Designed and implemented the Apple News syndication pipeline, opening a new digital
       distribution channel and directly contributing an additional revenue stream for the company.`,
    ],
    pills: [
      'Python',
      'Django',
      'Django REST Framework',
      'Flask',
      'Node.js',
      'REST API Design',
      'PostgreSQL',
      'AWS Lambda',
      'AWS S3',
      'AWS Elastic Beanstalk',
      'Celery',
      'Docker',
      'Jenkins',
      'pytest',
    ],
  },
  {
    key: 'rockcreek',
    company: 'The Rock Creek Group',
    logo: 'RockCreek.svg',
    title: 'Quantitative Analyst, Investment Analytics & Data',
    dates: 'Jul 2016 - Apr 2018',
    location: 'Washington, DC',
    summary: [
      `Built internal analytical tooling and data infrastructure supporting investment
       decision-making at a multi-billion dollar asset management firm. Regularly bridged
       quantitative analysis and software development teams, formalizing and automating previously
       manual analytical workflows through Python-based tooling. This role marks the foundation of
       my professional software engineering practice.`,
    ],
    pills: [
      'Python',
      'Django REST Framework',
      'Django',
      'React',
      'React-Redux',
      'Node.js',
      'SASS',
      'mySQL',
      'MongoDB',
      'd3.js',
      'AWS Lambda',
      'AWS S3',
      'pandas',
    ],
  },
  {
    key: 'pianalytics',
    company: 'PI Analytics',
    logo: 'PIAnalytics.svg',
    title: 'Quantitative Research Analyst',
    dates: 'Apr 2015 - Jul 2016',
    location: 'Olney, MD',
    summary: [
      `Researched and implemented complex models for credit default risk across exotic derivatives
       and structured products, using Python for numerical computation and Monte Carlo simulation.`,
    ],
    pills: [
      'Python',
      'JavaScript',
      'Flask',
      'Django',
      'Credit Default Risk Modeling',
      'Numerical Computation',
      'Monte Carlo Methods',
    ],
  },
];

const BY_KEY = new Map(ROLES.map(role => [role.key, role]));

/** Look up roles by key, in the order given, failing loudly on a typo in `pages.ts`. */
export function rolesByKey(keys: string[]): Role[] {
  return keys.map(key => {
    const role = BY_KEY.get(key);
    if (!role) {
      throw new Error(`No role with key '${key}'. Known keys: ${[...BY_KEY.keys()].join(', ')}.`);
    }
    return role;
  });
}
