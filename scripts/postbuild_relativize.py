#!/usr/bin/env python3
"""
Rewrite root-absolute asset URLs in the built output to relative ones.

Astro emits `/_astro/style.css` and Vite emits `/assets/fonts/...` inside that CSS. Both are
correct when the site is served from a domain root, and both break when the built resume is
opened straight off disk over file:// -- which is the normal way to look at it and exactly what
the PDF renderer does.

Every page lands at the root of the output directory (`build.format: 'file'`), so:
  - in HTML,  /_astro/x        ->  _astro/x
  - in CSS,   /assets/fonts/x  ->  ../assets/fonts/x   (CSS lives one level down, in _astro/)

Run as part of `npm run build`.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "output", "resume_html")


def rewrite(path, pattern, replacement):
    """Apply one substitution to a file, returning the number of replacements made."""
    with open(path, encoding="utf-8") as f:
        original = f.read()
    updated, count = re.subn(pattern, replacement, original)
    if count:
        with open(path, "w", encoding="utf-8") as f:
            f.write(updated)
    return count


def main():
    if not os.path.isdir(OUT):
        sys.exit("Build output not found at {}. Run `astro build` first.".format(OUT))

    html_count = 0
    css_count = 0

    for dirpath, _dirnames, filenames in os.walk(OUT):
        for filename in filenames:
            path = os.path.join(dirpath, filename)
            if filename.endswith(".html"):
                # Pages sit at the output root, so the leading slash is all that needs to go.
                html_count += rewrite(path, r'(["\'(])/_astro/', r"\1_astro/")
            elif filename.endswith(".css"):
                # This CSS lives in _astro/, one level below the assets it references.
                css_count += rewrite(path, r'(["\'(])/assets/', r"\1../assets/")

    print(
        "relativize: rewrote {} _astro reference(s) in HTML, "
        "{} asset reference(s) in CSS".format(html_count, css_count)
    )

    # A page that still carries a root-absolute reference will silently 404 over file://, so fail
    # the build rather than shipping output that looks fine until it is opened from disk.
    stragglers = []
    for dirpath, _dirnames, filenames in os.walk(OUT):
        for filename in filenames:
            if not filename.endswith((".html", ".css")):
                continue
            path = os.path.join(dirpath, filename)
            with open(path, encoding="utf-8") as f:
                content = f.read()
            if re.search(r'["\'(]/(?:_astro|assets)/', content):
                stragglers.append(os.path.relpath(path, OUT))

    if stragglers:
        sys.exit(
            "relativize: root-absolute references remain in: {}".format(", ".join(stragglers))
        )

    print("relativize: clean")


if __name__ == "__main__":
    main()
