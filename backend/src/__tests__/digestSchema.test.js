import { describe, it, expect } from 'vitest';
import { validateDigestOutput } from '../llm/digestSchema.js';

describe('digestSchema validation', () => {
  const validHindiWords = Array(320).fill('खबर').join(' ');
  const validScript = `राम-राम सा! आज की प्रमुख खबरां सुणो। ${validHindiWords} इस प्रकार आज का अपडेट पूरा हुआ। प्रश्न हल करें।`;

  const validQuestions = [
    { question: 'Q1?', options: ['A1', 'B1', 'C1', 'D1'], correct_index: 0, explanation: 'Exp1' },
    { question: 'Q2?', options: ['A2', 'B2', 'C2', 'D2'], correct_index: 1, explanation: 'Exp2' },
    { question: 'Q3?', options: ['A3', 'B3', 'C3', 'D3'], correct_index: 2, explanation: 'Exp3' },
    { question: 'Q4?', options: ['A4', 'B4', 'C4', 'D4'], correct_index: 0, explanation: 'Exp4' },
    { question: 'Q5?', options: ['A5', 'B5', 'C5', 'D5'], correct_index: 3, explanation: 'Exp5' },
  ];

  it('passes for valid digest object', () => {
    const validData = {
      title: 'आज का दैनिक डाइजेस्ट',
      script: validScript,
      questions: validQuestions,
    };
    const res = validateDigestOutput(validData);
    expect(res.valid).toBe(true);
  });

  it('fails if title is too short or script contains markdown', () => {
    const invalidData = {
      title: 'Short',
      script: '### Title \n * bullet item',
      questions: validQuestions,
    };
    const res = validateDigestOutput(invalidData);
    expect(res.valid).toBe(false);
    expect(res.problems.length).toBeGreaterThan(0);
  });

  it('fails if question correct_indices are all identical', () => {
    const identicalCorrect = validQuestions.map((q) => ({ ...q, correct_index: 1 }));
    const invalidData = {
      title: 'वैध शीर्षक नाम',
      script: validScript,
      questions: identicalCorrect,
    };
    const res = validateDigestOutput(invalidData);
    expect(res.valid).toBe(false);
    expect(res.problems).toContain('Questions must have at least 2 different correct option positions across the 5 items');
  });
});
