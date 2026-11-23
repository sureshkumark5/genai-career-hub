# GenAI Career Hub

A small static web app that tracks enterprise GenAI for an Amazon Connect and AWS Bedrock practitioner:

- **This week**: the latest weekly update and one career action
- **Career plan**: positioning and a 12-month roadmap
- **Certifications**: AWS GenAI certifications, free microcredentials and free courses, ranked, with a "done" tracker saved in your browser
- **Tech radar**: AWS GenAI and open-source stack in Adopt / Trial / Assess / Hold rings
- **Playbook**: reference architecture, four blueprints and a production-readiness checklist
- **Archive**: every weekly update

## How it works

- Plain HTML, CSS and JavaScript; no build step, no dependencies.
- All content is in `data/*.json`. Every item links to its source.
- A GitHub Action validates the data (`scripts/validate_data.py`) and deploys to GitHub Pages on every push to `main`.
- The data is refreshed weekly following [UPDATING.md](UPDATING.md).

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## One-time setup

In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
