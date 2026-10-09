function cleanText(text) {
  if (!text) return '';
  let str = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return str;
}

function truncateAtSentence(text, maxLen) {
  if (text.length <= maxLen) return text;
  const sliced = text.slice(0, maxLen);
  const lastDot = Math.max(sliced.lastIndexOf('.'), sliced.lastIndexOf('।'), sliced.lastIndexOf('\n'));
  if (lastDot > maxLen * 0.5) {
    return sliced.slice(0, lastDot + 1).trim();
  }
  return sliced.trim();
}

export function normalizeItem(raw, source) {
  const title = cleanText(raw.title || '').slice(0, 200);
  const rawBody = cleanText(raw.body || '');
  const body = truncateAtSentence(rawBody, 2500);

  let published_at = null;
  if (raw.published_at) {
    const d = new Date(raw.published_at);
    if (!isNaN(d.getTime())) {
      published_at = d.toISOString();
    }
  }

  return {
    source_id: source.id,
    source_name: source.name,
    url: raw.url,
    title,
    body,
    published_at,
    priority: source.priority ?? 99,
  };
}
