import type { ContactEntry } from './types';

export const PROFILE = {
  name: 'Nick Florin',
  title: 'Senior Software Engineer',
  handle: '@nickmflorin',
  photo: 'Headshot.jpeg',
};

/** The "About" paragraphs in the sidebar of the opening sheet. Inline HTML is allowed. */
export const ABOUT: string[] = [
  `A detail-obsessed, ownership-driven, product-first engineer who goes well beyond closing
   tickets. Deeply invested in the <em>why</em> behind every feature, proactively identifying
   architectural gaps, raising engineering standards, and driving meaningful improvements across
   the product and the team, end-to-end, pushing the user experience forward at every turn.`,
  `Proactive by default: He proposes the fix before being asked, carries features from ambiguous
   scope to production polish.`,
  `Has a proven track record of leading cross-functional pods, delivering high-impact features,
   and elevating the engineering bar at every stage of a company's growth.`,
];

/** The plus-marked one-liners directly beneath the About block. */
export const HIGHLIGHTS: string[] = [
  '11 years of software engineering',
  'M.S. in Financial Mathematics, JHU',
  'B.S. in Electrical Engineering, RPI',
];

export const CONTACT: ContactEntry[] = [
  { icon: 'At', text: 'nickmflorin@gmail.com' },
  { icon: 'LinkedIn', text: 'in/nick-florin-5046063b/' },
  { icon: 'GitHub', text: 'github.com/nickmflorin' },
  { icon: 'Globe', text: 'www.nickflorin.com' },
];
