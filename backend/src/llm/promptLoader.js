import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptCache = new Map();

export function loadPrompt(name) {
  if (promptCache.has(name)) {
    return promptCache.get(name);
  }
  const filePath = join(__dirname, 'prompts', `${name}.md`);
  const content = readFileSync(filePath, 'utf8');
  promptCache.set(name, content);
  return content;
}

export function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in vars) || vars[key] === undefined || vars[key] === null) {
      throw new Error(`Missing variable '${key}' for prompt template`);
    }
    return String(vars[key]);
  });
}
