import { loadPrompt, render } from './promptLoader.js';
import { generateJson } from './llmClient.js';
import { validateDigestOutput } from './digestSchema.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

function buildItemsXml(items) {
  return items
    .map((item, idx) => {
      const pub = item.published_at ? item.published_at.slice(0, 10) : '';
      return `<item n="${idx + 1}" source="${item.source_name}" published="${pub}">\n<title>${item.title}</title>\n<text>${item.body}</text>\n</item>`;
    })
    .join('\n\n');
}

export async function generateDigest(items, date) {
  const systemPrompt = loadPrompt('digest.system');
  const userTemplate = loadPrompt('digest.user');
  const itemsXml = buildItemsXml(items);

  let currentPrompt = render(userTemplate, { date, items: itemsXml });
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info({ attempt, date }, 'Generating digest via LLM');
    const rawOutput = await generateJson({
      systemPrompt,
      userPrompt: currentPrompt,
    });

    const validation = validateDigestOutput(rawOutput);
    if (validation.valid) {
      const qList = validation.data.questions.map((q, idx) => ({
        position: idx + 1,
        question_text: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      }));

      return {
        title: validation.data.title,
        script: validation.data.script,
        questions: qList,
      };
    }

    logger.warn({ attempt, problems: validation.problems }, 'LLM output validation failed');
    if (attempt < maxAttempts) {
      currentPrompt += `\n\nYour previous output was rejected because:\n- ${validation.problems.join('\n- ')}`;
    }
  }

  throw new AppError(422, 'LLM_OUTPUT_INVALID', 'LLM output failed validation after retries');
}
