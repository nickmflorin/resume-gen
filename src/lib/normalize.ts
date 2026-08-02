/**
 * Normalization: authoring input in, content model out.
 *
 * The model types in `src/data/types.ts` mirror Prisma exactly — non-null `id`, `slug`, `order`,
 * `visible`, and `excludedChannels` on every node — which is correct for a database and miserable
 * to write by hand. The data files are therefore authored against the `*Input` types, and this
 * module is the single boundary that turns them into `ContentOwner`s: it assigns ids, generates
 * slugs, stamps `order` from array position, applies the defaults, and collapses the whitespace of
 * copy authored as indented template literals.
 *
 * It also enforces the invariants Postgres cannot (see `docs/content-model.md`), loudly. A data
 * file that violates one fails the build rather than rendering something subtly wrong.
 *
 * This module WRITES `visible` and `excludedChannels`; it never reads them to decide anything. That
 * decision lives in exactly one place, `resolveSyndication` in `./syndication.ts`.
 */
import {
  ContentOwnerType,
  NodeKind,
  type ContentInput,
  type ContentNode,
  type ContentOwner,
  type NestedContentNode,
  type NestedNodeInput,
  type NodeInput,
  type Resolved,
  type SyndicationChannel,
} from '../data/types';
import { resolveSyndication } from './syndication';

/* Copy carries inline HTML (<em>, <strong>, <code>) and is authored as indented template literals
   in the data files, so the authoring whitespace is collapsed here, once, rather than at every
   render site. */
const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * A slug from a title. Titles are HTML, so tags and entities come out before the text is
 * kebab-cased: `Bundle Size &amp; First Load Performance` becomes `bundle-size-first-load-
 * performance`.
 */
function slugify(title: string): string {
  return title
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[#0-9a-z]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * A slug unique within one parent — not globally. A generated slug for an arbitrary paragraph is
 * only meaningful in the context of the thing it hangs off, so collisions across different roles
 * are fine and expected; collisions within one are de-duplicated with a numeric suffix.
 *
 * Untitled nodes (every summary paragraph, for instance) fall back to a positional slug.
 */
function uniqueSlug(title: string | null, fallback: string, taken: Set<string>): string {
  const base = title === null ? '' : slugify(title);
  let slug = base === '' ? fallback : base;
  for (let n = 2; taken.has(slug); n++) {
    slug = `${base === '' ? fallback : base}-${n}`;
  }
  taken.add(slug);
  return slug;
}

/** Invariant 4: `content` is a SINGLE paragraph. Several paragraphs are several nodes. */
function assertSingleParagraph(content: string, where: string): void {
  if (/<\/?p[\s/>]/i.test(content)) {
    throw new Error(
      `${where}: content holds a <p> tag, so it is more than one paragraph. Per-paragraph ` +
        `syndication is the entire point of the model; author one node per paragraph instead.`,
    );
  }
}

/**
 * Invariant 5: a node should not repeat an exclusion its owner already declares. Harmless — the
 * cascade AND-s anyway — but it makes the data lie about intent, so it fails here.
 */
function assertNoRedundantExclusions(
  own: readonly SyndicationChannel[],
  inherited: readonly SyndicationChannel[],
  where: string,
): void {
  const repeated = own.filter(channel => inherited.includes(channel));
  if (repeated.length > 0) {
    throw new Error(
      `${where}: excludes ${repeated.join(', ')}, which an ancestor already excludes. The cascade ` +
        `handles this; listing it again is noise.`,
    );
  }
}

function normalizeNested(
  input: NestedNodeInput,
  order: number,
  parentId: string,
  inherited: readonly SyndicationChannel[],
  taken: Set<string>,
): NestedContentNode {
  const title = input.title === undefined ? null : collapse(input.title);
  const content = input.content === undefined ? null : collapse(input.content);
  const slug = uniqueSlug(title, `item-${order + 1}`, taken);
  const where = `${parentId}/${slug}`;

  if (content !== null) {
    assertSingleParagraph(content, where);
  }
  const excludedChannels = input.excludedChannels ?? [];
  assertNoRedundantExclusions(excludedChannels, inherited, where);

  return {
    id: `${parentId}/${slug}`,
    parentId,
    slug,
    title,
    content,
    order,
    titleLayout: input.titleLayout ?? null,
    skills: input.skills ?? [],
    visible: input.visible ?? true,
    excludedChannels,
  };
}

function normalizeNode(
  input: NodeInput,
  order: number,
  kind: NodeKind,
  ownerId: string,
  ownerType: ContentOwnerType,
  inherited: readonly SyndicationChannel[],
  taken: Set<string>,
): ContentNode {
  const title = input.title === undefined ? null : collapse(input.title);
  const content = input.content === undefined ? null : collapse(input.content);
  const fallback = `${kind === NodeKind.Summary ? 'summary' : 'content'}-${order + 1}`;
  const slug = uniqueSlug(title, fallback, taken);
  const where = `${ownerId}/${slug}`;

  /* Invariants 2 and 3: a summary is always standalone prose. This is the guarantee given up by
     folding summaries into `ContentNode` instead of a third model, and this is where it is paid
     back. */
  if (kind === NodeKind.Summary && input.type !== undefined) {
    throw new Error(`${where}: a summary never carries a type; it is always standalone prose.`);
  }
  if (kind === NodeKind.Summary && input.children !== undefined) {
    throw new Error(`${where}: a summary never has children; author it as content instead.`);
  }
  if (content !== null) {
    assertSingleParagraph(content, where);
  }
  const excludedChannels = input.excludedChannels ?? [];
  assertNoRedundantExclusions(excludedChannels, inherited, where);

  const id = `${ownerId}/${slug}`;
  const childInherited = [...inherited, ...excludedChannels];
  const childSlugs = new Set<string>();

  return {
    id,
    ownerId,
    ownerType,
    kind,
    slug,
    title,
    content,
    order,
    titleLayout: input.titleLayout ?? null,
    type: input.type ?? null,
    skills: input.skills ?? [],
    visible: input.visible ?? true,
    excludedChannels,
    children: (input.children ?? []).map((child, index) =>
      normalizeNested(child, index, id, childInherited, childSlugs),
    ),
  };
}

/**
 * Turn one role's or degree's authored content into a `ContentOwner`.
 *
 * `slug` doubles as the owner id: the keys in `experience.ts` and `education.ts` are already stable
 * and unique, which is exactly what an id has to be. Node ids are paths beneath it, so every id in
 * the tree is deterministic and reproducible across builds — a generated uuid would churn the whole
 * tree on every run.
 */
export function normalizeOwner(
  slug: string,
  ownerType: ContentOwnerType,
  input: ContentInput,
): ContentOwner {
  const excludedChannels = input.excludedChannels ?? [];
  /* Summaries and content share one `nodes` collection because they are one table, and one slug
     namespace because they share the `@@unique([slug, ownerId, ownerType])` key. */
  const taken = new Set<string>();
  const summary = (input.summary ?? []).map((node, index) =>
    normalizeNode(node, index, NodeKind.Summary, slug, ownerType, excludedChannels, taken),
  );
  const content = (input.content ?? []).map((node, index) =>
    normalizeNode(node, index, NodeKind.Content, slug, ownerType, excludedChannels, taken),
  );

  return {
    id: slug,
    slug,
    ownerType,
    nodes: [...summary, ...content],
    skills: input.skills ?? [],
    visible: input.visible ?? true,
    excludedChannels,
  };
}

/** Anything authored with a stable key and a content tree: a `Role` or a `Degree`. */
interface Authored {
  readonly key: string;
  readonly content: ContentInput;
}

/**
 * Normalize and resolve a list of roles or degrees for one channel, dropping any withheld from it.
 *
 * This is the whole pipeline in one call, and the only way content reaches a component: the
 * authored `ContentInput` is replaced by a `ResolvedOwner`, so an unresolved tree cannot be
 * rendered by accident.
 */
export function resolveContent<T extends Authored>(
  items: readonly T[],
  ownerType: ContentOwnerType,
  channel: SyndicationChannel,
): Resolved<T>[] {
  return items.flatMap(item => {
    const owner = resolveSyndication(normalizeOwner(item.key, ownerType, item.content), channel);
    if (owner === null) {
      return [];
    }
    const { content: _content, ...rest } = item;
    return [{ ...rest, content: owner } as Resolved<T>];
  });
}
