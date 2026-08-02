import { ContentOwnerType, SyndicationChannel, type Degree, type ResolvedDegree } from './types';
import { resolveContent } from '../lib/normalize';

/**
 * Every degree. A degree's prose is one summary node — the same content tree a role has, used at
 * its simplest — so a line can be withheld from a channel exactly the way a role's can.
 */
export const DEGREES: Degree[] = [
  {
    key: 'jhu-computational',
    degree: 'M.S. in Computational Mathematics',
    school: 'The Johns Hopkins University',
    logo: 'JHU.svg',
    dates: 'Jan 2016 - Postponed',
    location: 'Baltimore, MD',
    gpa: 'GPA 3.70 / 4.00',
    content: {
      summary: [
        { content: 'Ongoing coursework toward an additional degree, temporarily postponed.' },
      ],
    },
  },
  {
    key: 'jhu-financial',
    degree: 'M.S. in Engineering; Financial Mathematics',
    school: 'The Johns Hopkins University',
    logo: 'JHU.svg',
    dates: 'Aug 2014 - Jan 2016',
    location: 'Baltimore, MD',
    gpa: 'GPA 3.85 / 4.00',
    content: {
      summary: [
        {
          content:
            'Advanced coursework in Applied Mathematics, Statistics &amp; Numerical Computation.',
        },
      ],
    },
  },
  {
    key: 'rpi',
    degree: 'B.S. in Electrical Engineering',
    school: 'Rensselaer Polytechnic Institute',
    logo: 'RPI.svg',
    dates: 'Aug 2010 - May 2014',
    location: 'Troy, NY',
    gpa: 'GPA 3.50 / 4.00',
    content: {
      summary: [
        { content: 'Minor in Economics; Concentration in Robotics &amp; Control Systems.' },
      ],
    },
  },
];

const BY_KEY = new Map(DEGREES.map(degree => [degree.key, degree]));

/**
 * Look up degrees by key, in the order given, failing loudly on a typo in `pages.ts`, and hand back
 * their content already normalized and resolved for the resume.
 */
export function degreesByKey(keys: string[]): ResolvedDegree[] {
  const degrees = keys.map(key => {
    const degree = BY_KEY.get(key);
    if (!degree) {
      throw new Error(`No degree with key '${key}'. Known keys: ${[...BY_KEY.keys()].join(', ')}.`);
    }
    return degree;
  });
  return resolveContent(degrees, ContentOwnerType.Education, SyndicationChannel.Resume);
}
