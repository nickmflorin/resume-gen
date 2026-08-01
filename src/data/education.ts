import type { Degree } from './types';

export const DEGREES: Degree[] = [
  {
    key: 'jhu-computational',
    degree: 'M.S. in Computational Mathematics',
    school: 'The Johns Hopkins University',
    logo: 'JHU.svg',
    dates: 'Jan 2016 - Postponed',
    location: 'Baltimore, MD',
    gpa: 'GPA 3.70 / 4.00',
    description: 'Ongoing coursework toward an additional degree, temporarily postponed.',
  },
  {
    key: 'jhu-financial',
    degree: 'M.S. in Engineering; Financial Mathematics',
    school: 'The Johns Hopkins University',
    logo: 'JHU.svg',
    dates: 'Aug 2014 - Jan 2016',
    location: 'Baltimore, MD',
    gpa: 'GPA 3.85 / 4.00',
    description:
      'Advanced coursework in Applied Mathematics, Statistics &amp; Numerical Computation.',
  },
  {
    key: 'rpi',
    degree: 'B.S. in Electrical Engineering',
    school: 'Rensselaer Polytechnic Institute',
    logo: 'RPI.svg',
    dates: 'Aug 2010 - May 2014',
    location: 'Troy, NY',
    gpa: 'GPA 3.50 / 4.00',
    description: 'Minor in Economics; Concentration in Robotics &amp; Control Systems.',
  },
];

const BY_KEY = new Map(DEGREES.map(degree => [degree.key, degree]));

/** Look up degrees by key, in the order given, failing loudly on a typo in `pages.ts`. */
export function degreesByKey(keys: string[]): Degree[] {
  return keys.map(key => {
    const degree = BY_KEY.get(key);
    if (!degree) {
      throw new Error(`No degree with key '${key}'. Known keys: ${[...BY_KEY.keys()].join(', ')}.`);
    }
    return degree;
  });
}
