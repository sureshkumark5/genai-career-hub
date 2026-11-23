#!/usr/bin/env python3
"""Validate /data/*.json before deploy. Exits non-zero on any problem."""
import json
import re
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
errors = []


def err(msg):
    errors.append(msg)


def load(name):
    try:
        return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        err(f"{name}.json: cannot parse ({e})")
        return None


def https(url, where):
    if not isinstance(url, str) or not url.startswith("https://"):
        err(f"{where}: url must start with https:// (got {url!r})")


def need(obj, keys, where):
    for k in keys:
        if k not in obj or obj[k] in (None, ""):
            err(f"{where}: missing '{k}'")


updates = load("updates")
if updates:
    entries = updates.get("entries", [])
    if not entries:
        err("updates.json: no entries")
    weeks = [e.get("week", "") for e in entries]
    if weeks != sorted(weeks, reverse=True):
        err("updates.json: entries must be newest first")
    if len(weeks) != len(set(weeks)):
        err("updates.json: duplicate week")
    for i, e in enumerate(entries):
        need(e, ["week", "headline", "items"], f"updates[{i}]")
        if not DATE.match(e.get("week", "")):
            err(f"updates[{i}]: week must be YYYY-MM-DD")
        for j, it in enumerate(e.get("items", [])):
            need(it, ["category", "title", "summary", "url"], f"updates[{i}].items[{j}]")
            https(it.get("url"), f"updates[{i}].items[{j}]")

certs = load("certifications")
if certs:
    ids = set()
    for i, c in enumerate(certs.get("items", [])):
        w = f"certifications[{i}]"
        need(c, ["id", "name", "vendor", "type", "cost", "status", "fit", "priority", "why", "url"], w)
        if c.get("fit") not in {"Top pick", "Recommended", "Optional", "Skip"}:
            err(f"{w}: fit must be Top pick / Recommended / Optional / Skip")
        if c.get("id") in ids:
            err(f"{w}: duplicate id {c.get('id')}")
        ids.add(c.get("id"))
        https(c.get("url"), w)
        for s in c.get("sources", []):
            https(s, w + ".sources")

tech = load("techstack")
if tech:
    rings = set(tech.get("rings", []))
    for i, t in enumerate(tech.get("items", [])):
        w = f"techstack[{i}]"
        need(t, ["name", "area", "ring", "what", "why", "url"], w)
        if t.get("ring") not in rings:
            err(f"{w}: ring {t.get('ring')!r} not in rings")
        https(t.get("url"), w)

road = load("roadmap")
if road:
    need(road, ["positioning", "phases"], "roadmap")

play = load("playbook")
if play:
    need(play, ["layers", "blueprints", "checklist"], "playbook")

if errors:
    print("Data validation FAILED:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("Data validation passed.")
