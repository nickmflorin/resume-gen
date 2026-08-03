import type { SidebarSection } from './types';

/**
 * Every sidebar section, keyed by name. `pages.ts` decides which sheet each one appears on, so
 * rebalancing the sidebar across sheets is a change there, not here.
 */

export const LANGUAGES_AND_FRAMEWORKS: SidebarSection = {
  kind: 'bars',
  heading: 'Languages & Frameworks',
  bars: [
    { name: 'Python', level: 'expert' },
    { name: 'TypeScript', level: 'expert' },
    { name: 'JavaScript', level: 'expert' },
    { name: 'React', level: 'expert' },
    { name: 'Next.js', level: 'expert' },
    { name: 'Django / DRF', level: 'expert' },
    { name: 'Flask', level: 'expert' },
    { name: 'Node.js', level: 'advanced' },
    { name: 'Express.js', level: 'proficient' },
    { name: 'GraphQL', level: 'advanced' },
    { name: 'Redux', level: 'advanced' },
    { name: 'TailwindCSS', level: 'advanced' },
    { name: 'Prisma', level: 'advanced' },
    { name: 'SASS / SCSS', level: 'advanced' },
    { name: 'Swift', level: 'proficient' },
    { name: 'Go', level: 'familiar' },
    { name: 'C++', level: 'familiar' },
  ],
};

export const TOP_SKILLS: SidebarSection = {
  kind: 'pills',
  heading: 'Top Skills',
  pills: [
    'Python',
    'TypeScript',
    'React',
    'Django / DRF',
    'Next.js',
    'GraphQL',
    'Flask',
    'Node.js',
    'AWS',
    'PostgreSQL',
    'REST API Design',
    'SSR / RSC',
    'Microfrontends',
    'Testing (RTL, Jest, Playwright)',
    'Monorepo (Nx)',
    'Accessibility (axe-core)',
  ],
};

export const KEY_STRENGTHS: SidebarSection = {
  kind: 'pills',
  heading: 'Key Strengths',
  pills: [
    'Full-Stack Ownership',
    'Systems Architecture',
    'Performance Engineering',
    'Developer Experience',
    'Design / UX Partnership',
    'Engineering Leadership',
    'Cross-Functional Delivery',
  ],
};

export const CLOUD_AND_DATABASES: SidebarSection = {
  kind: 'bars',
  heading: 'Cloud & Databases',
  bars: [
    { name: 'PostgreSQL', level: 'advanced' },
    { name: 'AWS', level: 'advanced' },
    { name: 'Docker', level: 'advanced' },
    { name: 'Redis', level: 'familiar' },
    { name: 'GCP', level: 'proficient' },
    { name: 'Vercel', level: 'proficient' },
    { name: 'NoSQL Databases', level: 'familiar' },
  ],
};

export const ARCHITECTURAL_PATTERNS: SidebarSection = {
  kind: 'pills',
  heading: 'Architectural Patterns',
  pills: [
    'Service-Oriented Arch',
    'Microservices',
    'Microfrontends',
    'Mesh-Style Architecture',
    'Monorepo (Nx, lerna)',
    'Server-Oriented Frontend',
    'SSR / RSC',
    'GraphQL Schema Design',
    'REST API Design',
    'Component Architecture',
    'Design Systems',
    'CI/CD Pipeline Design',
    'Event-Driven Architecture',
    'Bundle Analysis',
    'Performance Engineering',
    'Structured Logging',
    'Accessibility (WCAG)',
    'Observability',
  ],
};

export const UI_AND_COMPONENT_LIBRARIES: SidebarSection = {
  kind: 'pills',
  heading: 'UI & Component Libraries',
  pills: ['MUI (Material UI)', 'Mantine', 'shadcn/ui', 'Styled Components', 'Emotion', 'Radix UI'],
};

export const TESTING: SidebarSection = {
  kind: 'pills',
  heading: 'Testing',
  pills: [
    'Jest',
    'vitest',
    'React Testing Library',
    'Playwright',
    'Cypress',
    'pytest',
    'Storybook',
    'Visual Regression',
    'tox',
    'codecov',
    'Unit / Integration / E2E',
  ],
};

export const MONOREPO_AND_BUILD: SidebarSection = {
  kind: 'pills',
  heading: 'Monorepo & Build',
  pills: [
    'Nx',
    'Turborepo',
    'Lerna',
    'pnpm workspaces',
    'yarn workspaces',
    'Bundle Analyzer',
    'Tree-shaking',
    'Remote Build Caching',
    'Affected-task Pipelines',
  ],
};

export const CODE_QUALITY_AND_DX: SidebarSection = {
  kind: 'pills',
  heading: 'Code Quality & DX',
  pills: [
    'ESLint',
    'Prettier',
    'Stylelint',
    'TypeScript Strict',
    'Zod',
    'mypy',
    'pylint',
    'flake8',
    'black',
    'Husky',
    'lint-staged',
    'Commitlint',
    'Dependabot',
    'Renovate',
  ],
};

export const AI_TOOLING_AND_AUTOMATION: SidebarSection = {
  kind: 'pills',
  heading: 'AI Tooling & Automation',
  pills: [
    'Claude Code',
    'Claude Design',
    'Cursor',
    'GitHub Copilot',
    'Agentic Workflows',
    'MCP Integrations',
    'AI Code Review Automation',
    'Context Engineering',
    'Custom Agents & Skills',
    'Agent Guardrails (ESLint, CI)',
    'Spec-Driven Development',
    'Prompt Engineering',
  ],
};

export const CICD_AND_AUTOMATION: SidebarSection = {
  kind: 'pills',
  heading: 'CI/CD & Automation',
  pills: [
    'GitHub Actions',
    'CircleCI',
    'Jenkins',
    'Docker',
    'Reusable Workflows',
    'Poetry',
    'pnpm',
  ],
};
