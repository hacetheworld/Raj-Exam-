import { sources, examKeywords } from './sources.config.js';
import { fetchRssItems } from './fetchers/rss.js';
import { fetchHtmlItems } from './fetchers/html.js';
import { normalizeItem } from './normalize.js';
import { dedupe } from './dedupe.js';
import { getPipelineEnv } from '../config/env.js';
import { logger } from '../utils/logger.js';

function countKeywordHits(text) {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const kw of examKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      hits += 1;
    }
  }
  return hits;
}

export async function scrapeAll() {
  const env = getPipelineEnv();
  const enabledSources = sources
    .filter((s) => s.enabled)
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));

  logger.info({ count: enabledSources.length }, 'Starting scrapeAll with enabled sources');
  let rawItems = [];

  for (const source of enabledSources) {
    try {
      let fetched = [];
      if (source.type === 'rss') {
        fetched = await fetchRssItems(source);
      } else if (source.type === 'html') {
        fetched = await fetchHtmlItems(source);
      }

      const normalized = fetched.map((item) => normalizeItem(item, source));
      logger.info({ sourceId: source.id, fetchedCount: normalized.length }, 'Fetched source items');
      rawItems = rawItems.concat(normalized);
    } catch (err) {
      logger.error({ sourceId: source.id, err: err.message }, 'Failed scraping source, skipping');
    }
  }

  // Filter lookback hours & minimum body length (200 chars)
  const now = Date.now();
  const maxAgeMs = env.PIPELINE_LOOKBACK_HOURS * 3600 * 1000;

  const validItems = rawItems.filter((item) => {
    if (item.body.length < 200) return false;
    if (item.published_at) {
      const itemTime = new Date(item.published_at).getTime();
      if (!isNaN(itemTime) && now - itemTime > maxAgeMs) {
        return false;
      }
    }
    return true;
  });

  const dedupedItems = dedupe(validItems);

  // Score items by (priority, keyword hits, recency)
  const scored = dedupedItems.map((item) => {
    const priorityScore = (10 - Math.min(item.priority, 10)) * 10;
    const kwHits = countKeywordHits(`${item.title} ${item.body}`);
    const kwScore = kwHits * 5;

    let recencyScore = 0;
    if (item.published_at) {
      const ageHours = (now - new Date(item.published_at).getTime()) / (3600 * 1000);
      recencyScore = Math.max(0, 24 - ageHours);
    }

    const totalScore = priorityScore + kwScore + recencyScore;
    return { item, score: totalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  const finalItems = scored.slice(0, env.PIPELINE_MAX_ITEMS).map((s) => s.item);

  logger.info({ totalScraped: rawItems.length, finalCount: finalItems.length }, 'Scraping completed');
  return finalItems;
}
