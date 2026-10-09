'use client';

import { useState } from 'react';
import { Check, X, HelpCircle, Award } from 'lucide-react';

export default function QuizCard({ questions }) {
  const [answers, setAnswers] = useState({});

  if (!questions || questions.length === 0) return null;

  const handleSelectOption = (questionId, optionIndex) => {
    if (answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const correctCount = questions.reduce((count, q) => {
    return answers[q.id] === q.correct_index ? count + 1 : count;
  }, 0);

  return (
    <div className="bg-surface rounded-xl border border-line p-5 mb-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="font-bold text-ink text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand" />
          <span>Daily Quiz (5 MCQs)</span>
        </h3>
        <span className="text-xs text-muted font-medium">
          {answeredCount} / {totalQuestions} answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const chosenIdx = answers[q.id];
          const isAnswered = chosenIdx !== undefined;

          return (
            <div key={q.id || idx} className="space-y-3 pt-2">
              <p className="font-semibold text-ink text-base">
                {idx + 1}. {q.question_text}
              </p>

              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  let styleClass = 'bg-surface border-line text-ink hover:bg-cream';
                  let icon = null;

                  if (isAnswered) {
                    if (optIdx === q.correct_index) {
                      styleClass = 'bg-correct-bg border-correct-border text-correct-text font-semibold';
                      icon = <Check className="w-4 h-4 text-correct-border shrink-0" />;
                    } else if (optIdx === chosenIdx) {
                      styleClass = 'bg-wrong-bg border-wrong-border text-wrong-text font-semibold';
                      icon = <X className="w-4 h-4 text-wrong-border shrink-0" />;
                    } else {
                      styleClass = 'bg-surface border-line text-muted opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center justify-between min-h-[44px] focus:ring-2 focus:ring-focus outline-none ${styleClass}`}
                    >
                      <span className="pr-2">{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-2 p-3 bg-cream rounded-lg border border-line text-xs text-ink leading-relaxed">
                  <span className="font-bold text-brand block mb-0.5">Explanation:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === totalQuestions && (
        <div className="mt-6 p-4 bg-cream rounded-xl border border-line text-center space-y-1 animate-fade-in">
          <Award className="w-8 h-8 text-brand mx-auto mb-1" />
          <h4 className="font-bold text-ink text-lg">Quiz Complete!</h4>
          <p className="text-base text-ink font-semibold">
            You got <span className="text-brand font-bold text-xl">{correctCount}</span> of {totalQuestions} correct
          </p>
        </div>
      )}
    </div>
  );
}
