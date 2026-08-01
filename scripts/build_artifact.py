#!/usr/bin/env python3
"""
Bundle the built resume into ONE self-contained HTML file.

Takes the browsing view (index.html, every sheet stacked) and inlines everything it references --
stylesheets, fonts, logos, the headshot -- as data URIs, so the result is a single file that can
be emailed or uploaded and will render identically with no network and no sibling assets.

Run `npm run build` first; `npm run dist` does both in order.

Output:
  build/output/resume.html
"""
import base64
import mimetypes
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build", "output", "resume_html")
SOURCE = os.path.join(BUILD, "index.html")
OUTPUT = os.path.join(ROOT, "build", "output", "resume.html")

MIME_TYPES = {
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
}


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = MIME_TYPES.get(ext) or mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("ascii")
    return "data:{};base64,{}".format(mime, encoded)


def resolve(reference, base_dir):
    """Resolve a URL as written in a document back to a file inside the build output."""
    reference = reference.split("?")[0].split("#")[0]
    if reference.startswith("data:") or "://" in reference:
        return None
    candidate = os.path.normpath(os.path.join(base_dir, reference))
    return candidate if os.path.isfile(candidate) else None


def inline_css(css, css_path):
    """Replace every url(...) in a stylesheet with a data URI."""
    base_dir = os.path.dirname(css_path)
    misses = []

    def replace(match):
        quote, reference = match.group(1), match.group(2)
        path = resolve(reference, base_dir)
        if path is None:
            if not reference.startswith("data:"):
                misses.append(reference)
            return match.group(0)
        return "url({}{}{})".format(quote, data_uri(path), quote)

    css = re.sub(r'url\((["\']?)([^"\')]+)\1\)', replace, css)
    return css, misses


def main():
    if not os.path.isfile(SOURCE):
        sys.exit("Built index.html not found at {}. Run `npm run build` first.".format(SOURCE))

    with open(SOURCE, encoding="utf-8") as f:
        html = f.read()

    misses = []

    # 1. Replace every <link rel="stylesheet"> with an inline <style>, itself fully inlined.
    def replace_stylesheet(match):
        href = match.group(1)
        path = resolve(href, BUILD)
        if path is None:
            misses.append(href)
            return match.group(0)
        with open(path, encoding="utf-8") as f:
            css = f.read()
        css, css_misses = inline_css(css, path)
        misses.extend(css_misses)
        return "<style>\n{}\n</style>".format(css)

    html = re.sub(
        r'<link\s+rel=["\']stylesheet["\']\s+href=["\']([^"\']+)["\']\s*/?>',
        replace_stylesheet,
        html,
    )

    # 2. Inline every remaining asset the document references directly (logos, the headshot).
    def replace_src(match):
        attr, quote, reference = match.group(1), match.group(2), match.group(3)
        path = resolve(reference, BUILD)
        if path is None:
            if not reference.startswith("data:"):
                misses.append(reference)
            return match.group(0)
        return '{}={}{}{}'.format(attr, quote, data_uri(path), quote)

    html = re.sub(r'\b(src|href)=(["\'])([^"\']+)\2', replace_src, html)

    if misses:
        sys.exit(
            "artifact: could not resolve {} reference(s): {}".format(
                len(misses), ", ".join(sorted(set(misses)))
            )
        )

    # Nothing may reach the output that still points at a sibling file.
    leftover = re.findall(r'\b(?:src|href)=["\'](?!data:)([^"\']+)["\']', html)
    leftover = [ref for ref in leftover if "://" not in ref]
    if leftover:
        sys.exit("artifact: unbundled reference(s) remain: {}".format(", ".join(leftover)))

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(OUTPUT) / 1024
    print("Wrote {} ({:.0f} KB, fully self-contained)".format(OUTPUT, size_kb))


if __name__ == "__main__":
    main()
