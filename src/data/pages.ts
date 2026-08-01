import type { Sheet } from './types';
import {
  ARCHITECTURAL_PATTERNS,
  CICD_AND_AUTOMATION,
  CLOUD_AND_DATABASES,
  CODE_QUALITY_AND_DX,
  KEY_STRENGTHS,
  LANGUAGES_AND_FRAMEWORKS,
  MONOREPO_AND_BUILD,
  TESTING,
  TOP_SKILLS,
  UI_AND_COMPONENT_LIBRARIES,
} from './skills';

/**
 * THE PAGE LAYOUT. Page breaks are assigned here by hand, not flowed by CSS: each sheet is a
 * standalone 8.5x11 document, which is what guarantees a role is never split across a page
 * boundary in the PDF.
 *
 * Adding content therefore means rebalancing sheets by hand. `npm run dev` renders every sheet
 * with a visible boundary so overflow is obvious; content that runs past the bottom edge of a
 * sheet is clipped rather than pushed onto a new page.
 */
export const SHEETS: Sheet[] = [
  {
    id: 'page-1',
    intro: true,
    sections: [LANGUAGES_AND_FRAMEWORKS, TOP_SKILLS],
    main: [{ kind: 'roles', file: 'experience.ts', roles: ['craft'] }],
  },
  {
    id: 'page-2',
    intro: false,
    sections: [
      KEY_STRENGTHS,
      CLOUD_AND_DATABASES,
      ARCHITECTURAL_PATTERNS,
      UI_AND_COMPONENT_LIBRARIES,
      TESTING,
      MONOREPO_AND_BUILD,
      CODE_QUALITY_AND_DX,
    ],
    main: [
      {
        kind: 'roles',
        file: 'experience.ts',
        roles: ['northbeam', 'shelfcycle', 'corsha', 'greenbudget', 'nirveda'],
      },
    ],
  },
  {
    id: 'page-3',
    intro: false,
    sections: [CICD_AND_AUTOMATION],
    main: [
      {
        kind: 'roles',
        file: 'experience.ts',
        roles: ['saracen', 'atlantic', 'rockcreek', 'pianalytics'],
      },
      {
        kind: 'education',
        file: 'education.ts',
        degrees: ['jhu-computational', 'jhu-financial', 'rpi'],
      },
    ],
  },
];
