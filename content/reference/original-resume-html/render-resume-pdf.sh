#!/usr/bin/env bash
#
# Build Resume.pdf from the modular per-page HTML files.
#
# Strategy:
#   1. Render each page-N.html to its own single-page PDF with headless Chrome.
#   2. Concatenate those per-page PDFs into Resume.pdf with pypdf.
#
# Each page-N.html is a self-contained 8.5×11 document, so per-page rendering
# eliminates every possible mid-role page-break artifact. There is no
# index.html build step anymore — the merge operates directly on the per-page
# PDFs.
#
# Source layout:
#   ~/ai/career/resume/
#     style.css     — shared styles
#     page-1.html   — Craft (self-contained, one 8.5×11 sheet)
#     page-2.html   — Northbeam → Saracen Energy
#     page-3.html   — The Atlantic → Education
#
# Prerequisites:
#   - Google Chrome at the standard macOS location
#   - python3 available on PATH (any reasonably recent macOS or Homebrew build)
#
# The PDF merge runs in a dedicated virtualenv at ~/.cache/resume-pdf-venv
# so a single `pypdf` dependency gets installed once and cached — no changes
# to the system Python environment, no reliance on Apple bundling PyObjC.
#
# Usage:
#   ./render-resume-pdf.sh
#   (or)  bash render-resume-pdf.sh
#
# Output:
#   ~/ai/career/Resume-<Mon>-<DD>-<YYYY>-<H:MMam|pm>.pdf
#     e.g. Resume-Mar-20-2026-1:34pm.pdf
#   The timestamp is generated at script runtime so every export is uniquely
#   named and previous versions are preserved alongside the new one.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
RESUME_DIR="$HOME/ai/career/resume"

# Build a human-readable timestamp for the filename, e.g. "Mar-20-2026-1:34pm".
# - %b   : abbreviated month name (kept capitalized)
# - %d   : zero-padded day of month
# - %Y   : 4-digit year
# - %l   : 12-hour hour with leading space for single digits → trim the space
# - %M   : zero-padded minute
# - %p   : AM/PM (upper on BSD/macOS date) → lowercased for the target format
DATE_PART="$(date "+%b-%d-%Y")"
HOUR_PART="$(date "+%l" | tr -d ' ')"
MIN_PART="$(date "+%M")"
AMPM_PART="$(date "+%p" | tr '[:upper:]' '[:lower:]')"
OUTPUT="$HOME/ai/career/Resume-${DATE_PART}-${HOUR_PART}:${MIN_PART}${AMPM_PART}.pdf"

TMP_DIR="$(mktemp -d -t resume-pdf)"
trap 'rm -rf "$TMP_DIR"' EXIT

# ---------------------------------------------------------------------------
# 1. Render each page-N.html to its own single-page PDF in $TMP_DIR.
#
# Bash glob expansion is alphabetically sorted, which matches the numerical
# ordering of page-1.html, page-2.html, page-3.html (correct up to page-9).
# ---------------------------------------------------------------------------
pages=("$RESUME_DIR"/page-*.html)
if [[ ${#pages[@]} -eq 0 || ! -f "${pages[0]}" ]]; then
  echo "No page-*.html files found in $RESUME_DIR" >&2
  exit 1
fi

tmp_pdfs=()
for page in "${pages[@]}"; do
  name="$(basename "$page" .html)"
  tmp_pdf="$TMP_DIR/$name.pdf"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-pdf-header-footer \
    --print-to-pdf="$tmp_pdf" \
    "file://$page" 2>/dev/null
  tmp_pdfs+=("$tmp_pdf")
  echo "Rendered $name"
done

# ---------------------------------------------------------------------------
# 2. Concatenate the per-page PDFs into one Resume.pdf via pypdf.
#
# pypdf lives in a dedicated, cached virtualenv so this script has zero
# effect on the system Python. First run creates the venv (~1s); subsequent
# runs reuse it and skip straight to the merge.
# ---------------------------------------------------------------------------
VENV_DIR="$HOME/.cache/resume-pdf-venv"
VENV_PY="$VENV_DIR/bin/python3"

if [[ ! -x "$VENV_PY" ]]; then
  echo "First run: creating venv with pypdf at $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
  "$VENV_DIR/bin/pip" install --quiet --upgrade pip
  "$VENV_DIR/bin/pip" install --quiet pypdf
fi

"$VENV_PY" - "$OUTPUT" "${tmp_pdfs[@]}" <<'PY'
import sys
from pypdf import PdfWriter

output = sys.argv[1]
inputs = sys.argv[2:]

writer = PdfWriter()
for path in inputs:
    writer.append(path)
with open(output, "wb") as f:
    writer.write(f)
PY

echo "Wrote $OUTPUT"
