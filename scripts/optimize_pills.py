#!/usr/bin/env python3
"""
Reorder the pills in each sidebar pill section so they pack into the fewest rows.

Pills wrap greedily (flex-wrap), so their ORDER decides how many rows they occupy. This script
measures every pill's true rendered width with headless Chrome (same engine that renders the PDF),
solves the row-minimization exactly per section, and rewrites the `pills` arrays in
src/data/skills.ts in the optimal order. The data file stays the source of truth: the order you
see there is the order on the page.

Method:
  1. Render a scratch page in build/output/resume_html/ (so the built CSS and fonts resolve) with
     every pill section in a real `.sidebar` / `.s-pills` context, and read each pill's
     getBoundingClientRect() width plus the container width and flex gap.
  2. Per section, find the minimum possible row count (branch-and-bound bin packing — exact, the
     sections are small).
  3. Among orderings that achieve that minimum, pick the one closest to the original order
     (fewest pairwise inversions). A section already at its minimum is left untouched.
  4. Render the proposed orders in a second Chrome pass and count actual rows, so the result is
     verified by the layout engine, not just the simulation.
  5. Rewrite the arrays (string literals are moved verbatim, never re-quoted) and run Prettier.

The measured pages are the BUILD OUTPUT, so run `npm run build` first.

Usage:
  python3 scripts/optimize_pills.py --dry-run          # report + proposed orders, no writes
  python3 scripts/optimize_pills.py                    # rewrite src/data/skills.ts
  python3 scripts/optimize_pills.py --pin 'AI Tooling & Automation=2'
                                                       # keep that section's first 2 pills first
  python3 scripts/optimize_pills.py --section 'Testing'  # only optimize the named section(s)
"""

import argparse
import base64
import html
import json
import math
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "build", "output", "resume_html")
SKILLS_TS = os.path.join(ROOT, "src", "data", "skills.ts")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Safety margin (px) against subpixel differences between the measuring render and the real one.
# Erring conservative can only waste a sliver of a row, never clip.
EPS = 0.5

# Search budget for the closest-to-original enumeration. The packing OPTIMUM is exact regardless;
# this only bounds how hard we look for the *nicest* ordering that achieves it.
NODE_BUDGET = 400_000


# --------------------------------------------------------------------------- skills.ts parsing

SECTION_RE = re.compile(
    r"heading:\s*'((?:[^'\\]|\\.)*)'\s*,\s*pills:\s*\[(.*?)\]", re.DOTALL
)
LITERAL_RE = re.compile(r"'(?:[^'\\]|\\.)*'")


def unescape_ts(literal):
    """TS single-quoted string literal -> its text."""
    return re.sub(r"\\(.)", r"\1", literal[1:-1])


def parse_sections(source):
    """Every pills section: heading, the literal tokens verbatim, and the span of the array body."""
    sections = []
    for match in SECTION_RE.finditer(source):
        literals = LITERAL_RE.findall(match.group(2))
        sections.append(
            {
                "heading": unescape_ts("'" + match.group(1) + "'"),
                "literals": literals,
                "texts": [unescape_ts(lit) for lit in literals],
                "body_span": match.span(2),
            }
        )
    return sections


# --------------------------------------------------------------------------- browser measurement

MEASURE_JS = """
<script>
  const measure = () => {
    const out = [];
    document.querySelectorAll('.s-pills').forEach(container => {
      const style = getComputedStyle(container);
      const pills = Array.from(container.children);
      out.push({
        width: container.getBoundingClientRect().width,
        gap: parseFloat(style.columnGap) || 0,
        rowGap: parseFloat(style.rowGap) || 0,
        pills: pills.map(pill => {
          const rect = pill.getBoundingClientRect();
          return { w: rect.width, h: rect.height };
        }),
        rows: new Set(pills.map(pill => Math.round(pill.getBoundingClientRect().top))).size,
      });
    });
    document.getElementById('MEASURE').textContent = btoa(JSON.stringify(out));
  };
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => addEventListener('load', resolve));
  Promise.all([document.fonts.ready, loaded]).then(() => requestAnimationFrame(measure));
</script>
"""


def stylesheet_links():
    """The <link rel="stylesheet"> tags from a built sheet, so the scratch page uses the same CSS."""
    page = os.path.join(PAGES_DIR, "page-1.html")
    if not os.path.isfile(page):
        sys.exit("No built pages in {}. Run `npm run build` first.".format(PAGES_DIR))
    with open(page, encoding="utf-8") as f:
        links = re.findall(r'<link[^>]*rel="stylesheet"[^>]*>', f.read())
    if not links:
        sys.exit("No stylesheet links found in page-1.html; was the build modified?")
    return "".join(links)


def measure(section_pill_texts):
    """Render each list of pill texts in a real sidebar context; return per-section metrics."""
    blocks = []
    for texts in section_pill_texts:
        spans = "".join(
            "<span class='s-pill'>{}</span>".format(html.escape(text)) for text in texts
        )
        blocks.append("<div class='s-pills'>{}</div>".format(spans))
    document = (
        "<!doctype html><html><head><meta charset='utf-8'>{links}</head><body>"
        "<div class='page'><aside class='sidebar'>{blocks}</aside></div>"
        "<div id='MEASURE'></div>{script}</body></html>"
    ).format(links=stylesheet_links(), blocks="".join(blocks), script=MEASURE_JS)

    scratch = os.path.join(PAGES_DIR, "pills-measure.html")
    with open(scratch, "w", encoding="utf-8") as f:
        f.write(document)
    try:
        found = None
        for attempt in range(3):
            with tempfile.TemporaryDirectory(prefix="pills-chrome") as profile:
                result = subprocess.run(
                    [
                        CHROME,
                        "--headless=new",
                        "--disable-gpu",
                        "--no-first-run",
                        "--user-data-dir=" + profile,
                        "--virtual-time-budget=10000",
                        "--dump-dom",
                        "file://" + scratch,
                    ],
                    capture_output=True,
                    text=True,
                )
            found = re.search(r'<div id="MEASURE">([A-Za-z0-9+/=]+)</div>', result.stdout)
            if found:
                break
            print("Chrome measurement attempt {} failed, retrying...".format(attempt + 1))
    finally:
        os.remove(scratch)

    if not found:
        sys.stderr.write(result.stderr[-2000:] + "\n")
        sys.exit("Measurement page produced no result; is Chrome at {}?".format(CHROME))
    results = json.loads(base64.b64decode(found.group(1)))
    if len(results) != len(section_pill_texts):
        sys.exit("Measured {} sections, expected {}.".format(len(results), len(section_pill_texts)))
    return results


# --------------------------------------------------------------------------- packing

def fits(used, width, capacity, gap):
    added = width if used == 0 else used + gap + width
    return added <= capacity - EPS


def place(used, width, gap):
    return width if used == 0 else used + gap + width


def greedy_rows(widths, capacity, gap):
    """Row layout flex-wrap produces for this order. Greedy is exactly what the browser does."""
    rows, used = 1 if widths else 0, 0.0
    for width in widths:
        if used and not fits(used, width, capacity, gap):
            rows += 1
            used = width
        else:
            used = place(used, width, gap)
    return rows


def min_rows(widths, capacity, gap, open_bin=None):
    """Exact minimum bin count (branch & bound). `open_bin` is a pre-filled row that counts."""
    initial = [] if open_bin is None else [open_bin]

    def ffd():
        bins = list(initial)
        for width in sorted(widths, reverse=True):
            for i, used in enumerate(bins):
                if fits(used, width, capacity, gap):
                    bins[i] = place(used, width, gap)
                    break
            else:
                bins.append(width)
        return max(len(bins), len(initial))

    items = sorted(widths, reverse=True)
    n = len(items)
    suffix = [0.0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i + 1] + items[i]

    best = [ffd()]
    bins = list(initial)

    def lower_bound(k):
        slack = sum(max(0.0, capacity - EPS - used) for used in bins)
        deficit = suffix[k] - slack
        return len(bins) + (math.ceil(deficit / capacity) if deficit > 0 else 0)

    def dfs(k):
        if k == n:
            best[0] = min(best[0], max(len(bins), len(initial)))
            return
        if lower_bound(k) >= best[0]:
            return
        width = items[k]
        tried = set()
        for i, used in enumerate(bins):
            key = round(used, 3)
            if key in tried or not fits(used, width, capacity, gap):
                continue
            tried.add(key)
            bins[i] = place(used, width, gap)
            dfs(k + 1)
            bins[i] = used
        if len(bins) + 1 < best[0]:
            bins.append(width)
            dfs(k + 1)
            bins.pop()

    dfs(0)
    return best[0]


def inversions(order):
    """Pairs rendered in the opposite of their original relative order."""
    return sum(
        1
        for i in range(len(order))
        for j in range(i + 1, len(order))
        if order[i] > order[j]
    )


def closest_optimal_order(widths, capacity, gap, pin, target_rows):
    """
    An ordering of range(len(widths)) achieving `target_rows`, with the pinned prefix first,
    chosen to minimize inversions against the original order.

    Enumerates row-partitions depth-first in ORIGINAL item order (so low-inversion solutions
    surface early), realizes each as rows-in-creation-order with items in original order, and
    scores it. Budgeted: the row count stays exact even if the budget trips; only "closest"
    degrades toward best-found.
    """
    pinned = list(range(pin))
    rest = list(range(pin, len(widths)))

    # Greedy-place the pinned prefix; its last row stays open for whatever follows.
    open_used = 0.0
    closed = 0
    for index in pinned:
        if open_used and not fits(open_used, widths[index], capacity, gap):
            closed += 1
            open_used = widths[index]
        else:
            open_used = place(open_used, widths[index], gap)

    best = {"order": None, "score": None}
    nodes = [0]
    # Each bin is one row: [used_width, rest_positions]. When there is a pinned prefix, bin 0 is
    # its still-open last row; `closed` prefix rows sit above all of this and never change.
    bins = [[open_used, []]] if pinned else []
    rest_suffix = [0.0] * (len(rest) + 1)
    for i in range(len(rest) - 1, -1, -1):
        rest_suffix[i] = rest_suffix[i + 1] + widths[rest[i]]

    def consider():
        order = list(pinned)
        for _, members in bins:
            order.extend(rest[k] for k in members)
        if greedy_rows([widths[i] for i in order], capacity, gap) != target_rows:
            return
        score = inversions(order)
        if best["score"] is None or score < best["score"]:
            best["order"], best["score"] = order, score

    def dfs(k):
        if nodes[0] >= NODE_BUDGET:
            return
        nodes[0] += 1
        if k == len(rest):
            consider()
            return
        rows_used = closed + len(bins)
        slack = sum(max(0.0, capacity - EPS - used) for used, _ in bins)
        deficit = rest_suffix[k] - slack
        extra = math.ceil(deficit / capacity) if deficit > 0 else 0
        if rows_used + extra > target_rows:
            return
        width = widths[rest[k]]
        for entry in bins:
            used = entry[0]
            if fits(used, width, capacity, gap):
                entry[0] = place(used, width, gap)
                entry[1].append(k)
                dfs(k + 1)
                entry[1].pop()
                entry[0] = used
        if rows_used + 1 <= target_rows:
            bins.append([width, [k]])
            dfs(k + 1)
            bins.pop()

    dfs(0)
    return best["order"], best["score"]


# --------------------------------------------------------------------------- main

def parse_pins(pin_args, headings):
    pins = {}
    for spec in pin_args or []:
        if "=" not in spec:
            sys.exit("--pin expects 'Heading=N', got: {}".format(spec))
        heading, _, count = spec.rpartition("=")
        if heading not in headings:
            sys.exit("--pin: no pills section with heading '{}'".format(heading))
        pins[heading] = int(count)
    return pins


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument("--dry-run", action="store_true", help="report only; do not rewrite")
    parser.add_argument("--pin", action="append", metavar="HEADING=N",
                        help="keep the first N pills of HEADING in place (repeatable)")
    parser.add_argument("--section", action="append", metavar="HEADING",
                        help="only optimize the named section(s) (repeatable)")
    args = parser.parse_args()

    if not os.path.isfile(CHROME):
        sys.exit("Google Chrome not found at {}".format(CHROME))

    with open(SKILLS_TS, encoding="utf-8") as f:
        source = f.read()
    sections = parse_sections(source)
    if not sections:
        sys.exit("No pills sections found in {}".format(SKILLS_TS))
    headings = {s["heading"] for s in sections}
    pins = parse_pins(args.pin, headings)
    if args.section:
        missing = set(args.section) - headings
        if missing:
            sys.exit("--section: no pills section named {}".format(sorted(missing)))

    active = [s for s in sections if not args.section or s["heading"] in args.section]
    metrics = measure([s["texts"] for s in active])

    proposals = []
    for section, metric in zip(active, metrics):
        widths = [p["w"] for p in metric["pills"]]
        capacity, gap = metric["width"], metric["gap"]
        current_rows = metric["rows"]
        optimum = min_rows(widths, capacity, gap)
        pin = pins.get(section["heading"], 0)

        if pin:
            # The pinned prefix may force more rows than the unconstrained optimum.
            prefix_used, prefix_closed = 0.0, 0
            for i in range(pin):
                if prefix_used and not fits(prefix_used, widths[i], capacity, gap):
                    prefix_closed += 1
                    prefix_used = widths[i]
                else:
                    prefix_used = place(prefix_used, widths[i], gap)
            optimum = prefix_closed + min_rows(
                widths[pin:], capacity, gap, open_bin=prefix_used
            )

        if current_rows <= optimum:
            proposals.append(
                {"section": section, "rows": current_rows, "target": current_rows,
                 "order": None, "note": "already optimal"}
            )
            continue

        order, score = closest_optimal_order(widths, capacity, gap, pin, optimum)
        if order is None:
            proposals.append(
                {"section": section, "rows": current_rows, "target": current_rows,
                 "order": None, "note": "no ordering found within budget (kept as-is)"}
            )
            continue
        proposals.append(
            {"section": section, "rows": current_rows, "target": optimum, "order": order,
             "note": "{} inversions vs original".format(score)}
        )

    # Verify every proposed order with the layout engine itself before touching anything.
    changed = [p for p in proposals if p["order"]]
    if changed:
        verify = measure(
            [[p["section"]["texts"][i] for i in p["order"]] for p in changed]
        )
        for proposal, metric in zip(changed, verify):
            if metric["rows"] != proposal["target"]:
                proposal["order"] = None
                proposal["note"] = "verification found {} rows, expected {} (kept as-is)".format(
                    metric["rows"], proposal["target"]
                )
                proposal["target"] = proposal["rows"]

    row_height = None
    for metric in metrics:
        if metric["pills"]:
            row_height = metric["pills"][0]["h"] + metric["rowGap"]
            break

    print()
    saved_rows = 0
    for proposal in proposals:
        section = proposal["section"]
        delta = proposal["rows"] - proposal["target"]
        saved_rows += delta
        marker = "->" if delta else "=="
        print("{:32s} {} {} {} rows  ({})".format(
            section["heading"], proposal["rows"], marker, proposal["target"], proposal["note"]
        ))
        if proposal["order"] and args.dry_run:
            print("    proposed: {}".format(
                ", ".join(section["texts"][i] for i in proposal["order"])
            ))
    if row_height:
        print("\nTotal: {} row(s) saved (~{}px of sidebar height)".format(
            saved_rows, round(saved_rows * row_height)
        ))

    if args.dry_run or not any(p["order"] for p in proposals):
        if not args.dry_run:
            print("Nothing to rewrite.")
        return

    # Rewrite from the end so earlier spans stay valid; Prettier reflows the one-line arrays.
    rewritten = source
    for proposal in sorted(
        (p for p in proposals if p["order"]),
        key=lambda p: p["section"]["body_span"][0],
        reverse=True,
    ):
        start, end = proposal["section"]["body_span"]
        literals = proposal["section"]["literals"]
        body = ", ".join(literals[i] for i in proposal["order"])
        rewritten = rewritten[:start] + body + rewritten[end:]
    with open(SKILLS_TS, "w", encoding="utf-8") as f:
        f.write(rewritten)
    subprocess.check_call(
        ["npx", "prettier", "--write", os.path.relpath(SKILLS_TS, ROOT)], cwd=ROOT
    )
    print("Rewrote {} (run `npm run build` to regenerate output)".format(
        os.path.relpath(SKILLS_TS, ROOT)
    ))


if __name__ == "__main__":
    main()
