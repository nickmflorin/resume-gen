/**
 * The shape of every piece of resume content. Editing the resume means editing the data files
 * that satisfy these types; the components in `src/components/` are pure renderers over them.
 *
 * Two things live here. The first half is the CONTENT MODEL: a two-level, syndication-aware tree of
 * prose attached to roles and degrees, deliberately shaped to migrate 1:1 into the Prisma schema in
 * the `nick.florin` repository. The second half is the PRESENTATION shapes that surround it — the
 * fields of a role or degree that are not prose (company, logo, dates), the sidebar, and the sheet
 * layout.
 *
 * BEFORE CHANGING THE CONTENT MODEL, READ `docs/content-model.md`. It carries the target Prisma
 * schema, the field-by-field mapping, the invariants the database cannot enforce, and the reasoning
 * behind the shape (in particular why the tree is two concrete levels rather than self-recursive,
 * and why roles and degrees are not merged into one model).
 *
 * Two conventions in the content model exist purely for that future migration:
 *
 * 1. Enum VALUES are `SCREAMING_SNAKE`, because Prisma enum members are identifiers and these
 *    strings become those identifiers verbatim.
 * 2. `?` there means Prisma `null`, never `undefined`. The authoring types are the exception: they
 *    are what a human writes in a data file, and `src/lib/normalize.ts` turns them into the model
 *    types.
 */

/* -------------------------------------------------------------------------------------------- *
 * The content model
 * -------------------------------------------------------------------------------------------- */

/**
 * A medium the content can be published through. Modeled as an enum rather than one boolean column
 * per channel so that adding a channel (a tailored per-application resume variant, say) is a new
 * enum value rather than a migration on three tables.
 */
export enum SyndicationChannel {
  LinkedIn = 'LINKEDIN',
  Website = 'WEBSITE',
  Resume = 'RESUME',
}

/**
 * What a top-level content node hangs off. This is the polymorphic discriminator, and it lives on
 * the CHILD pointing up, never as a `type` column on a merged parent table: roles and degrees stay
 * separate models with their own relations and unique keys, and share one content tree between
 * them.
 */
export enum ContentOwnerType {
  Experience = 'EXPERIENCE',
  Education = 'EDUCATION',
}

/**
 * Distinguishes the two roles a top-level node can play. Summaries are the opening prose of a role
 * or degree; content nodes are the body beneath it.
 *
 * Summaries sort as a SET above content, not by interleaved index, so the sort key for top-level
 * nodes is `(kind, order)` with `SUMMARY` ordering before `CONTENT`.
 */
export enum NodeKind {
  Summary = 'SUMMARY',
  Content = 'CONTENT',
}

/**
 * How a top-level content node presents its children.
 *
 * `PARAGRAPH` is the default and means the node is standalone prose. The list types render their
 * children as `<ol>` / `<ul>`. Because only top-level nodes carry a type and nested nodes never do,
 * "a list may only contain paragraphs" is enforced structurally rather than by convention.
 */
export enum NodeType {
  Paragraph = 'PARAGRAPH',
  NumberedList = 'NUMBERED_LIST',
  BulletedList = 'BULLETED_LIST',
}

/**
 * Where a node's title sits relative to its content. Only meaningful when the node has both.
 *
 * Nullable because the default is DERIVED from context rather than stored: inside a list the
 * default is `INLINE`, otherwise `STACKED`. Resolve it at render time with `resolveTitleLayout`;
 * never persist the derived value, or changing the parent's type silently leaves stale layouts
 * behind.
 */
export enum TitleLayout {
  /** Title runs inline with the content, separated by a dash. */
  Inline = 'INLINE',
  /** Title sits on its own line above the content. */
  Stacked = 'STACKED',
}

/**
 * The syndication and ordering fields every level of the tree carries, including the owning role or
 * degree.
 *
 * This field set is deliberately repeated on all three models rather than factored into a shared
 * table. Syndication genuinely applies at every level, and the cascade in `resolveSyndication`
 * depends on each level answering for itself.
 */
export interface Syndicated {
  /**
   * Master switch. `false` removes the subtree from every channel and no descendant can re-enable
   * it. Mirrors `visible Boolean @default(true)`, which is already the convention on `Experience`
   * and `Education` in nick.florin.
   */
  readonly visible: boolean;
  /**
   * Channels this node is withheld from. Empty means "published everywhere", which is why the
   * exclusion list is modeled positively rather than as an inclusion list: `@default([])` is then
   * the permissive default and new nodes need no syndication decision at all.
   *
   * A descendant can only ever ADD exclusions in effect. Listing a channel here that an ancestor
   * already excludes is redundant but harmless.
   */
  readonly excludedChannels: readonly SyndicationChannel[];
}

/** Fields common to both levels of the content tree. */
interface ContentNodeBase extends Syndicated {
  readonly id: string;
  /**
   * Stable human-readable key. Unique per parent, NOT globally: a generated slug for an arbitrary
   * paragraph is only meaningful in the context of the thing it hangs off.
   */
  readonly slug: string;
  /**
   * Short bold lead-in, on the order of a few words. A node is never rendered as a title alone;
   * see the prune rule in `resolveSyndication`.
   *
   * HTML, like `content`: titles carry entities (`Bundle Size &amp; First Load Performance`) and
   * are rendered with `set:html`, not as text nodes.
   */
  readonly title: string | null;
  /**
   * A SINGLE paragraph of HTML. Prose split across multiple paragraphs, or a list of several
   * points, is several nodes, one row each. That granularity is the entire reason this is a tree
   * of rows rather than a blob: syndication is decided per paragraph.
   */
  readonly content: string | null;
  /** Position within the parent. Explicit because array order does not survive the move to rows. */
  readonly order: number;
  /** Null means "derive from context"; see `resolveTitleLayout`. */
  readonly titleLayout: TitleLayout | null;
  /**
   * Skill slugs referenced by this node. Skills attach at every level, matching nick.florin, where
   * `Detail` and `NestedDetail` both carry a `Skill[]` relation. Becomes an implicit many-to-many
   * join rather than a string column on migration.
   */
  readonly skills: readonly string[];
}

/**
 * The second and final level of the tree: an item within a parent's list, or a nested paragraph
 * beneath it.
 *
 * Carries no `type` and no children. Depth is capped at two by the schema itself rather than by a
 * rule someone has to remember, which is the whole reason this is a separate model instead of a
 * self-referential `parentId` on one table.
 */
export interface NestedContentNode extends ContentNodeBase {
  /** Real, non-null foreign key to the owning `ContentNode`. Deletes cascade. */
  readonly parentId: string;
}

/**
 * A top-level node: either the opening summary prose of a role or degree, or a body section
 * beneath it.
 *
 * Attaches to its owner polymorphically through `ownerId` + `ownerType`. That pair carries no
 * database-level foreign key, which is the accepted cost of one content tree serving both roles and
 * degrees; see `docs/content-model.md`.
 */
export interface ContentNode extends ContentNodeBase {
  readonly ownerId: string;
  readonly ownerType: ContentOwnerType;
  readonly kind: NodeKind;
  /**
   * Null is equivalent to `PARAGRAPH`.
   *
   * Meaningless when `kind` is `SUMMARY`, since summaries are always standalone prose and never
   * have children. That is the one guarantee given up by folding summaries into this model instead
   * of a third table, and it is enforced in application code rather than by the schema.
   */
  readonly type: NodeType | null;
  readonly children: readonly NestedContentNode[];
}

/**
 * What a role or degree contributes to the content tree.
 *
 * `Role` and `Degree` extend this rather than being merged into one model: they relate to different
 * entities (company vs. school) and have different natural keys, so a merged table would mean
 * nullable foreign keys, no integrity, and no usable unique constraint.
 */
export interface ContentOwner extends Syndicated {
  readonly id: string;
  readonly slug: string;
  readonly ownerType: ContentOwnerType;
  /**
   * Every top-level node, summaries and content together. Kept as one collection because they are
   * one table; `resolveSyndication` splits and orders them for rendering.
   */
  readonly nodes: readonly ContentNode[];
  /** Skill slugs for the owner itself, rendered today as the chip row beneath a role. */
  readonly skills: readonly string[];
}

/* -------------------------------------------------------------------------------------------- *
 * Resolved shapes
 *
 * The output of `resolveSyndication`: the same tree with everything that a given channel excludes
 * removed. Distinct types from the models above so that it is impossible to render an unresolved
 * tree by accident and quietly publish content that was meant to be withheld.
 * -------------------------------------------------------------------------------------------- */

export interface ResolvedNestedNode extends Omit<
  NestedContentNode,
  'excludedChannels' | 'visible'
> {
  readonly titleLayout: TitleLayout;
}

export interface ResolvedNode extends Omit<
  ContentNode,
  'excludedChannels' | 'visible' | 'children' | 'type'
> {
  readonly type: NodeType;
  readonly titleLayout: TitleLayout;
  readonly children: readonly ResolvedNestedNode[];
}

export interface ResolvedOwner extends Omit<
  ContentOwner,
  'excludedChannels' | 'visible' | 'nodes'
> {
  readonly summary: readonly ResolvedNode[];
  readonly content: readonly ResolvedNode[];
}

/* -------------------------------------------------------------------------------------------- *
 * Authoring shapes
 *
 * What a human writes in a data file. The model types above mirror Prisma exactly, which means
 * non-null `id`, `order`, `visible`, and `excludedChannels` on every node: correct for a database,
 * miserable to write by hand. These make the mechanical fields optional and let position in an
 * array stand in for `order`.
 *
 * `src/lib/normalize.ts` is the normalization step that assigns ids, slugs, and order indices,
 * applies the defaults, and collapses authoring whitespace.
 * -------------------------------------------------------------------------------------------- */

/**
 * Fields a human supplies by hand. Everything omitted from these types is mechanical and filled in
 * by normalization: `id` and `slug` are generated, `order` comes from array position, and the
 * parent references (`parentId`, `ownerId`, `ownerType`) come from where the node sits in the
 * structure.
 *
 * `title` and `content` may be authored as indented template literals; normalization collapses the
 * authoring whitespace, so indentation in the data files is free.
 */
interface NodeInputBase {
  readonly title?: string;
  readonly content?: string;
  readonly skills?: readonly string[];
  readonly titleLayout?: TitleLayout;
  /** Omit for the `true` default. */
  readonly visible?: boolean;
  /** Omit for "published everywhere". */
  readonly excludedChannels?: readonly SyndicationChannel[];
}

export type NestedNodeInput = NodeInputBase;

export interface NodeInput extends NodeInputBase {
  /** Omit for `PARAGRAPH`. Never set on a summary. */
  readonly type?: NodeType;
  readonly children?: readonly NestedNodeInput[];
}

/**
 * What a role or degree supplies. Summaries and content are authored as separate collections
 * because that is how they read and how they sort; normalization flattens them into one `nodes`
 * collection, stamping `kind` from which collection they came out of.
 */
export interface ContentInput {
  readonly summary?: readonly NodeInput[];
  readonly content?: readonly NodeInput[];
  readonly skills?: readonly string[];
  readonly visible?: boolean;
  readonly excludedChannels?: readonly SyndicationChannel[];
}

/* -------------------------------------------------------------------------------------------- *
 * Presentation shapes
 *
 * The non-prose fields around the content tree, plus the sidebar and sheet layout. None of this is
 * syndicated: a company name and a logo travel with the role wherever it is published, and
 * pagination is meaningless off the printed page.
 * -------------------------------------------------------------------------------------------- */

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
 * One role, as authored. The prose lives in `content`; everything else is presentation that the
 * content model has no opinion about.
 */
export interface Role {
  /** Stable key used by `pages.ts` to place this role on a sheet, and the content owner's slug. */
  key: string;
  company: string;
  /** Filename of the logo in `public/assets/logos/`, including the extension. */
  logo: string;
  title: string;
  dates: string;
  location: string;
  /**
   * The role's content tree. `summary` is the opening prose, `content` the titled sections beneath
   * it, and `skills` the technology chips shown at the bottom of the role.
   */
  content: ContentInput;
}

/** One degree, as authored. `content.summary` is the single line of prose beneath the header. */
export interface Degree {
  key: string;
  degree: string;
  school: string;
  /** Filename of the logo in `public/assets/logos/`, including the extension. */
  logo: string;
  dates: string;
  location: string;
  gpa?: string;
  content: ContentInput;
}

/**
 * A role or degree with its content tree already resolved for one channel. This is what the
 * components render: the unresolved `ContentInput` never reaches a component, so it is impossible
 * to publish content that was meant to be withheld.
 */
export type Resolved<T extends { content: ContentInput }> = Omit<T, 'content'> & {
  readonly content: ResolvedOwner;
};

export type ResolvedRole = Resolved<Role>;
export type ResolvedDegree = Resolved<Degree>;

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
