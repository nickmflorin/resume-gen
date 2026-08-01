/**
 * Every page is emitted at the root of the output directory (`build.format: 'file'`), so a plain
 * relative path resolves from any sheet and keeps the built HTML working over `file://` without a
 * server.
 */
export function logo(filename: string): string {
  return `assets/logos/${filename}`;
}

/** An icon is a logo referenced by basename, since every icon in the set is an SVG. */
export function icon(name: string): string {
  return logo(`${name}.svg`);
}
