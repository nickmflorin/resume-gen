/**
 * The shape of every piece of resume content. Editing the resume means editing the data files
 * that satisfy these types; the components in `src/components/` are pure renderers over them.
 */

/**
 * A proficiency tier. The tier drives both the badge text and the fill width/color of a skill
 * bar, so the four tiers are a closed set rather than a free-form string.
 */
export type Proficiency = 'expert' | 'advanced' | 'proficient' | 'familiar';

export interface SkillBar {
  name: string;
  level: Proficiency;
}

export interface ContactEntry {
  /** Basename of an SVG in `public/assets/logos/`, without the extension. */
  icon: string;
  text: string;
}

/**
 * One block in a sheet's sidebar. Sheets compose these in `pages.ts`, which is what lets page 1
 * carry the language bars while page 2 carries the pill groups.
 */
export type SidebarSection =
  | { kind: 'bars'; heading: string; bars: SkillBar[] }
  | { kind: 'pills'; heading: string; pills: string[] };

/**
 * A titled subsection within a role (the `<h4>` groups such as "Leadership" or "Architecture").
 * A section may carry prose, an ordered list of achievements, or both, in that order.
 */
export interface RoleSection {
  heading: string;
  /** Paragraphs of prose. May contain inline HTML (`<em>`, `<strong>`, `<code>`). */
  body?: string[];
  /** Numbered achievements. Each may contain inline HTML; a leading `<strong>` reads as a label. */
  items?: string[];
}

export interface Role {
  /** Stable key used by `pages.ts` to place this role on a sheet. */
  key: string;
  company: string;
  /** Filename of the logo in `public/assets/logos/`, including the extension. */
  logo: string;
  title: string;
  dates: string;
  location: string;
  /** Opening paragraphs, rendered above any sections. May contain inline HTML. */
  summary: string[];
  sections?: RoleSection[];
  /** Technology chips shown at the bottom of the role. */
  pills: string[];
}

export interface Degree {
  key: string;
  degree: string;
  school: string;
  /** Filename of the logo in `public/assets/logos/`, including the extension. */
  logo: string;
  dates: string;
  location: string;
  gpa?: string;
  description: string;
}

/**
 * A run of main-column content under one `experience.ts` / `education.ts` header. A sheet holds
 * an ordered list of these, which is how page 3 shows roles and then education beneath a second
 * header.
 */
export type MainBlock =
  | { kind: 'roles'; file: string; roles: string[] }
  | { kind: 'education'; file: string; degrees: string[] };

/**
 * One physical 8.5x11 sheet. Page breaks are assigned here by hand rather than flowed by CSS:
 * each sheet renders as its own standalone document, so a role can never be split across a page
 * boundary in the PDF.
 */
export interface Sheet {
  /** URL slug and output filename, e.g. `page-1` becomes `page-1.html`. */
  id: string;
  /**
   * Whether to render the profile's about/highlights/contact block above this sheet's sidebar
   * sections. True on the opening sheet only; later sheets repeat the photo and name alone.
   */
  intro: boolean;
  sections: SidebarSection[];
  main: MainBlock[];
}
