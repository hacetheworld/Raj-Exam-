import { z } from 'zod';

export const rawQuestionSchema = z.object({
  question: z.string().min(1).max(300),
  options: z
    .array(z.string().min(1).max(120))
    .length(4)
    .refine((opts) => new Set(opts).size === 4, {
      message: 'All 4 options must be distinct',
    }),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(300),
});

export const rawDigestSchema = z.object({
  title: z.string().min(5).max(80),
  script: z.string().min(1),
  questions: z.array(rawQuestionSchema).length(5),
});

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const markdownRegex = /[*#_`>\[\]]/;
const urlRegex = /https?:\/\/|www\./i;
const devanagariRegex = /[\u0900-\u097F]/;

export function checkScript(script) {
  const problems = [];

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 300 || wordCount > 480) {
    problems.push(`Script word count must be between 300 and 480 (got ${wordCount})`);
  }

  if (script.length > 3800) {
    problems.push(`Script character length must be at most 3800 (got ${script.length})`);
  }

  if (markdownRegex.test(script)) {
    problems.push('Script must not contain markdown characters (*, #, _, `, >, [, ])');
  }

  if (urlRegex.test(script)) {
    problems.push('Script must not contain URLs');
  }

  if (emojiRegex.test(script)) {
    problems.push('Script must not contain emojis');
  }

  if (!devanagariRegex.test(script)) {
    problems.push('Script must contain Devanagari text');
  }

  return problems;
}

export function checkQuestions(questions) {
  const problems = [];
  const correctIndices = new Set(questions.map((q) => q.correct_index));
  if (correctIndices.size < 2) {
    problems.push('Questions must have at least 2 different correct option positions across the 5 items');
  }
  return problems;
}

export function validateDigestOutput(output) {
  const parsed = rawDigestSchema.safeParse(output);
  if (!parsed.success) {
    return {
      valid: false,
      problems: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  const scriptProblems = checkScript(parsed.data.script);
  const qProblems = checkQuestions(parsed.data.questions);
  const allProblems = [...scriptProblems, ...qProblems];

  if (allProblems.length > 0) {
    return { valid: false, problems: allProblems };
  }

  return { valid: true, data: parsed.data, problems: [] };
}
