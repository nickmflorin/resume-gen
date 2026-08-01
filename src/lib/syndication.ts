/**
 * Resolving a content tree for one syndication channel.
 *
 * THIS IS THE ONLY PLACE THE CASCADE RULE LIVES. Nothing else should read `visible` or
 * `excludedChannels` directly; render from the `Resolved*` types this module returns. The rule is
 * specified in `docs/content-model.md` and summarized here.
 *
 * Resolution is two directions in a single post-order walk:
 *
 *   1. MASK (top-down). A node is eligible only if it is eligible itself AND every ancestor is.
 *      A descendant can never re-enable a channel an ancestor withheld.
 *
 *   2. PRUNE (bottom-up). A node that survived the mask is still dropped if rendering it would
 *      produce a bare title: no content of its own, and no surviving children. Because children
 *      resolve before their parent, one post-order pass settles this, including the case where
 *      pruning a child empties its parent.
 *
 * The prune rule applies to NODES, not to owners: a role whose every content node is withheld from
 * a channel still has a company, title, and dates worth rendering, so `resolveSyndication` returns
 * an owner with empty `summary` and `content` rather than null.
 */
import {
  NodeKind,
  NodeType,
  TitleLayout,
  type ContentNode,
  type ContentOwner,
  type NestedContentNode,
  type ResolvedNestedNode,
  type ResolvedNode,
  type ResolvedOwner,
  type SyndicationChannel,
  type Syndicated,
} from '../data/content-model';

/** Whether a single level permits the channel, ignoring ancestors and descendants. */
function permits(node: Syndicated, channel: SyndicationChannel): boolean {
  return node.visible && !node.excludedChannels.includes(channel);
}

/**
 * The layout to render a title with, given the type of the node that contains it.
 *
 * Stored as null when it should follow context, so that changing a parent from a list to a
 * paragraph updates its children rather than leaving them with a stale persisted layout.
 */
export function resolveTitleLayout(
  layout: TitleLayout | null,
  parentType: NodeType | null,
): TitleLayout {
  if (layout !== null) {
    return layout;
  }
  return parentType === NodeType.NumberedList || parentType === NodeType.BulletedList
    ? TitleLayout.Inline
    : TitleLayout.Stacked;
}

/**
 * A node with nothing to show but its title. Titles are a few bold words, meaningless alone, so
 * such a node is dropped rather than rendered.
 */
function isEmpty(content: string | null, survivingChildren: number): boolean {
  return content === null && survivingChildren === 0;
}

function resolveNested(
  node: NestedContentNode,
  parentType: NodeType,
  channel: SyndicationChannel,
): ResolvedNestedNode | null {
  if (!permits(node, channel)) {
    return null;
  }
  /* A nested node can never have children, so having no content always makes it empty. */
  if (isEmpty(node.content, 0)) {
    return null;
  }
  const { visible: _visible, excludedChannels: _excluded, ...rest } = node;
  return { ...rest, titleLayout: resolveTitleLayout(node.titleLayout, parentType) };
}

function resolveNode(node: ContentNode, channel: SyndicationChannel): ResolvedNode | null {
  if (!permits(node, channel)) {
    return null;
  }
  const type = node.type ?? NodeType.Paragraph;

  /* Post-order: children settle first, so the parent's prune decision below is made against the
     children that actually survived rather than the ones it was declared with. */
  const children = node.children
    .map(child => resolveNested(child, type, channel))
    .filter((child): child is ResolvedNestedNode => child !== null)
    .sort((a, b) => a.order - b.order);

  if (isEmpty(node.content, children.length)) {
    return null;
  }

  const {
    visible: _visible,
    excludedChannels: _excluded,
    children: _children,
    type: _type,
    ...rest
  } = node;
  return {
    ...rest,
    type,
    titleLayout: resolveTitleLayout(node.titleLayout, null),
    children,
  };
}

/**
 * Resolve an owner's whole content tree for one channel.
 *
 * Returns null only when the owner itself is withheld from the channel. An owner that survives is
 * always returned, even with no surviving nodes, because its own fields still render.
 *
 * Summaries come back separately from content and already ordered: they sort as a set above
 * content rather than interleaving with it, so the effective sort key is `(kind, order)`.
 */
export function resolveSyndication(
  owner: ContentOwner,
  channel: SyndicationChannel,
): ResolvedOwner | null {
  if (!permits(owner, channel)) {
    return null;
  }

  const resolved = owner.nodes
    .map(node => ({ kind: node.kind, node: resolveNode(node, channel) }))
    .filter((entry): entry is { kind: NodeKind; node: ResolvedNode } => entry.node !== null);

  const byKind = (kind: NodeKind): readonly ResolvedNode[] =>
    resolved
      .filter(entry => entry.kind === kind)
      .map(entry => entry.node)
      .sort((a, b) => a.order - b.order);

  const { visible: _visible, excludedChannels: _excluded, nodes: _nodes, ...rest } = owner;
  return {
    ...rest,
    summary: byKind(NodeKind.Summary),
    content: byKind(NodeKind.Content),
  };
}

/**
 * Resolve many owners at once, dropping those withheld from the channel entirely.
 *
 * This is the entry point a page or sheet should use; it guarantees nothing unresolved reaches the
 * renderer.
 */
export function resolveAll(
  owners: readonly ContentOwner[],
  channel: SyndicationChannel,
): readonly ResolvedOwner[] {
  return owners
    .map(owner => resolveSyndication(owner, channel))
    .filter((owner): owner is ResolvedOwner => owner !== null);
}
