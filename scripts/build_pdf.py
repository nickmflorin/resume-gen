#!/usr/bin/env python3
"""
Build the resume PDF from the built per-sheet HTML pages.

Strategy (carried over from the original render-resume-pdf.sh):
  1. Render each page-N.html to its own single-page PDF with headless Chrome.
  2. Concatenate those per-page PDFs with pypdf.

Each page-N.html is a self-contained 8.5x11 document, so rendering per page eliminates every
possible mid-role page-break artifact. The pages are the BUILD OUTPUT, so run `npm run build`
first; `npm run dist` does both in order.

pypdf lives in a dedicated cached virtualenv (~/.cache/resume-pdf-venv) so this has no effect on
the system Python.

Output:
  build/output/Resume-<Mon>-<DD>-<YYYY>-<h:mm><am|pm>.pdf
The timestamp is generated at run time, so every export is uniquely named and previous versions
are preserved alongside the new one.
"""
import glob
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "build", "output", "resume_html")
OUT_DIR = os.path.join(ROOT, "build", "output")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
VENV_DIR = os.path.expanduser("~/.cache/resume-pdf-venv")
VENV_PY = os.path.join(VENV_DIR, "bin", "python3")


def timestamped_name():
    """e.g. Resume-Aug-01-2026-3:47pm.pdf"""
    now = datetime.now()
    hour = now.strftime("%I").lstrip("0") or "12"
    return "Resume-{}-{}:{}{}.pdf".format(
        now.strftime("%b-%d-%Y"), hour, now.strftime("%M"), now.strftime("%p").lower()
    )


def sheet_pages():
    """Built sheets in page order, sorted numerically so page-10 never lands before page-2."""
    paths = glob.glob(os.path.join(PAGES_DIR, "page-*.html"))

    def page_number(path):
        match = re.search(r"page-(\d+)\.html$", path)
        return int(match.group(1)) if match else 0

    return sorted(paths, key=page_number)


def ensure_venv():
    if os.path.isfile(VENV_PY) and os.access(VENV_PY, os.X_OK):
        return
    print("First run: creating venv with pypdf at {}...".format(VENV_DIR))
    subprocess.check_call([sys.executable, "-m", "venv", VENV_DIR])
    pip = os.path.join(VENV_DIR, "bin", "pip")
    subprocess.check_call([pip, "install", "--quiet", "--upgrade", "pip"])
    subprocess.check_call([pip, "install", "--quiet", "pypdf"])


MERGE = """
import sys
from pypdf import PdfWriter

output = sys.argv[1]
writer = PdfWriter()
for path in sys.argv[2:]:
    writer.append(path)
with open(output, "wb") as f:
    writer.write(f)
"""


def main():
    if not os.path.isfile(CHROME):
        sys.exit("Google Chrome not found at {}".format(CHROME))

    pages = sheet_pages()
    if not pages:
        sys.exit(
            "No page-*.html found in {}. Run `npm run build` first.".format(PAGES_DIR)
        )

    output = os.path.join(OUT_DIR, timestamped_name())

    with tempfile.TemporaryDirectory(prefix="resume-pdf") as tmp:
        page_pdfs = []
        for page in pages:
            name = os.path.splitext(os.path.basename(page))[0]
            page_pdf = os.path.join(tmp, name + ".pdf")
            subprocess.check_call(
                [
                    CHROME,
                    "--headless=new",
                    "--disable-gpu",
                    "--no-pdf-header-footer",
                    "--print-to-pdf=" + page_pdf,
                    "file://" + page,
                ],
                stderr=subprocess.DEVNULL,
            )
            if not os.path.isfile(page_pdf):
                sys.exit("Chrome produced no PDF for {}".format(name))
            page_pdfs.append(page_pdf)
            print("Rendered {}".format(name))

        ensure_venv()
        subprocess.check_call([VENV_PY, "-c", MERGE, output] + page_pdfs)

    print("Wrote {}".format(output))


if __name__ == "__main__":
    main()
