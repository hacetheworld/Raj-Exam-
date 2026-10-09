import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { getPipelineEnv } from '../../config/env.js';
import { withRetry, isTransient } from '../../utils/retry.js';
import { logger } from '../../utils/logger.js';

const parser = new Parser();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchRssItems(source) {
  const env = getPipelineEnv();
  const headers = { 'User-Agent': env.SCRAPER_USER_AGENT };

  const xmlText = await withRetry(
    async () => {
      const res = await fetch(source.feedUrl, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        throw err;
      }
      const len = parseInt(res.headers.get('content-length') || '0', 10);
      if (len > 2 * 1024 * 1024) throw new Error('Response exceeds 2 MB');
      return await res.text();
    },
    { retries: 2, label: `rss-fetch-${source.id}`, shouldRetry: isTransient }
  );

  const feed = await parser.parseString(xmlText);
  let items = feed.items || [];

  if (source.mustMatch && source.mustMatch.length > 0) {
    items = items.filter((item) => {
      const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
      return source.mustMatch.some((kw) => text.includes(kw.toLowerCase()));
    });
  }

  items = items.slice(0, source.maxItems || 10);
  const results = [];

  for (const item of items) {
    const link = item.link;
    if (!link) continue;

    let body = item.contentSnippet || item.content || '';
    try {
      await sleep(500);
      const articleRes = await fetch(link, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (articleRes.ok) {
        const html = await articleRes.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header').remove();
        const paragraphs = $('p')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(Boolean);
        if (paragraphs.length > 0) {
          body = paragraphs.join('\n\n');
        }
      }
    } catch (err) {
      logger.warn({ link, err: err.message }, 'Article page fetch failed, using RSS snippet');
    }

    results.push({
      title: item.title || '',
      body,
      url: link,
      published_at: item.isoDate || item.pubDate || null,
    });
  }

  return results;
}
