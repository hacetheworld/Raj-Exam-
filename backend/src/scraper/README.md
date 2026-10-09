# Raj Exam AI Scraper

This directory contains the news scraping pipeline for Raj Exam AI.

## How Sources Work

Sources are declared in `sources.config.js`. Every source has:
- `id`: Unique identifier
- `name`: Human-readable name
- `type`: `'rss'` or `'html'`
- `priority`: Number (lower number = higher trust priority)
- `enabled`: Boolean (`false` until human-verified)

## Adding & Verifying a Source

1. Inspect the live target page using browser devtools.
2. For HTML sources: verify `listUrl`, CSS selectors (`item`, `link`, `title`, `date`, `articleBody`), and `dateFormat`.
3. For RSS sources: verify `feedUrl` and `mustMatch` keywords.
4. Update `sources.config.js` with verified values and change `enabled: false` to `enabled: true`.
5. Test scraping using `npm run pipeline -- --dry-run`.
