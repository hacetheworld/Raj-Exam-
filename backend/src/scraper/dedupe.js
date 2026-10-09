import { createHash } from 'node:crypto';

export function urlHash(urlStr) {
  try {
    const u = new URL(urlStr);
    u.search = '';
    u.hash = '';
    let clean = u.toString();
    if (clean.endsWith('/') && clean.length > 8) {
      clean = clean.slice(0, -1);
    }
    return createHash('sha256').update(clean).digest('hex');
  } catch {
    let clean = urlStr.split('?')[0].split('#')[0];
    if (clean.endsWith('/') && clean.length > 8) {
      clean = clean.slice(0, -1);
    }
    return createHash('sha256').update(clean).digest('hex');
  }
}

function getWordSet(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  return new Set(words);
}

export function jaccardSimilarity(textA, textB) {
  const setA = getWordSet(textA);
  const setB = getWordSet(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function dedupe(items) {
  const seenHashes = new Set();
  const kept = [];

  for (const item of items) {
    const hash = urlHash(item.url);
    if (seenHashes.has(hash)) {
      continue;
    }

    let isDuplicateTitle = false;
    for (const existing of kept) {
      if (jaccardSimilarity(item.title, existing.title) >= 0.8) {
        isDuplicateTitle = true;
        break;
      }
    }

    if (!isDuplicateTitle) {
      seenHashes.add(hash);
      kept.push(item);
    }
  }

  return kept;
}
