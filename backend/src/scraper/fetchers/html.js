import * as cheerio from 'cheerio';
import { getPipelineEnv } from '../../config/env.js';
import { withRetry, isTransient } from '../../utils/retry.js';
import { logger } from '../../utils/logger.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchHtmlItems(source) {
  const env = getPipelineEnv();
  const headers = { 'User-Agent': env.SCRAPER_USER_AGENT };

  const html = await withRetry(
    async () => {
      const res = await fetch(source.listUrl, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        throw err;
      }
      return await res.text();
    },
    { retries: 2, label: `html-fetch-${source.id}`, shouldRetry: isTransient }
  );

  const $ = cheerio.load(html);
  const items = [];
  const sourceOrigin = new URL(source.listUrl).origin;

  $(source.selectors.item).each((_, el) => {
    if (items.length >= (source.maxItems || 10)) return;
    const linkEl = $(el).find(source.selectors.link);
    let href = linkEl.attr('href');
    if (!href) return;

    try {
      const absoluteUrl = new URL(href, sourceOrigin).toString();
      if (new URL(absoluteUrl).origin !== sourceOrigin) return;

      const title = $(el).find(source.selectors.title).text().trim();
      const dateText = source.selectors.date ? $(el).find(source.selectors.date).text().trim() : '';

      items.push({
        url: absoluteUrl,
        title,
        dateText,
      });
    } catch (err) {
      logger.warn({ href, err: err.message }, 'Failed parsing URL in HTML fetcher');
    }
  });

  const results = [];
  for (const item of items) {
    let body = '';
    try {
      await sleep(500);
      const res = await fetch(item.url, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const articleHtml = await res.text();
        const $a = cheerio.load(articleHtml);
        body = $a(source.selectors.articleBody).text().trim();
      }
    } catch (err) {
      logger.warn({ url: item.url, err: err.message }, 'Failed fetching article page HTML');
    }

    results.push({
      title: item.title,
      body,
      url: item.url,
      published_at: item.dateText || null,
    });
  }

  return results;
}
