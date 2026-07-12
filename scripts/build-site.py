#!/usr/bin/env python3
"""Deploy static landing page to site/ output."""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "site"
OUT = ROOT / "site"  # single-page: source of truth lives in site/

# Legacy: remove old split pages if present
for stale in ("economy.html", "pillars.html", "e-court.html"):
    p = OUT / stale
    if p.exists():
        p.unlink()
for sub in ("dark", "pristine"):
    d = OUT / sub
    if d.exists():
        shutil.rmtree(d)

required = [OUT / "index.html", OUT / "app.js"]
missing = [p for p in required if not p.exists()]
if missing:
    raise SystemExit(f"Missing required files: {missing}")

print(f"Landing page ready at {OUT / 'index.html'}")
