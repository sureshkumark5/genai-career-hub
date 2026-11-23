# Weekly update procedure

This hub is refreshed once a week. Whoever runs the update (a person or an AI agent) follows these steps.

## 1. Research (last 7 days)

Check for changes since the newest entry in `data/updates.json`:

- **AWS GenAI**: Amazon Bedrock, Bedrock AgentCore, Amazon Connect (Customer and Health), Strands Agents, Amazon Q / Quick. Sources: AWS What's New, AWS News Blog, AgentCore release notes, Amazon Connect newsletter.
- **AWS certifications**: new, updated, beta or retired exams; price changes; free microcredentials and Skill Builder badges. Sources: AWS Training and Certification blog, official certification pages.
- **Free AI credentials**: Anthropic Academy, Hugging Face Learn, Google Cloud Skills Boost, Microsoft Learn, DeepLearning.AI, AWS Skill Builder.
- **Other vendor certifications**: Microsoft, Google, Anthropic, NVIDIA, Databricks; only if relevant to an AWS contact-center GenAI architect.
- **Open-source and protocols**: MCP, A2A, OpenTelemetry GenAI, LangGraph, major security incidents in AI tooling.

Only include items you opened and verified on a primary or reputable source. Never invent prices, dates or exam codes.

## 2. Edit the data

- `data/updates.json`: add ONE new entry at the top with `week` = today's date (YYYY-MM-DD), a one-sentence `headline`, 3–8 `items` (category, title, summary, https url) and one `careerAction`. If nothing material changed, add a short entry saying so with 1–2 items.
- `data/certifications.json`: update status, cost, fit or priority only when a source confirms it; add new credentials that fit; set `lastVerified`.
- `data/techstack.json`: move items between rings or add items when there is a clear reason; set `lastVerified`.
- `data/roadmap.json`: adjust goals when a change affects the plan (for example a beta window closing); set `lastReviewed`.
- Keep entries newest first. Keep the archive; do not delete old weeks.

## 3. Validate and publish

```bash
python3 scripts/validate_data.py
git add data && git commit -m "Weekly update YYYY-MM-DD"
git push origin main
```

The GitHub Action validates the data again and redeploys the site.
