'use client';

import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function StateCard({ variant, onAction, actionLabel, message }) {
  if (variant === 'loading') {
    return (
      <div className="bg-surface rounded-xl border border-line p-6 mb-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-cream rounded w-3/4"></div>
        <div className="h-20 bg-cream rounded w-full"></div>
        <div className="h-40 bg-cream rounded w-full"></div>
      </div>
    );
  }

  if (variant === 'notReady') {
    return (
      <div className="bg-surface rounded-xl border border-line p-6 mb-6 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-cream text-brand rounded-full flex items-center justify-center mx-auto border border-line">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink mb-1">Today's digest isn't ready yet.</h3>
          <p className="text-sm text-muted">
            {message || "Our nightly pipeline is processing today's current affairs."}
          </p>
        </div>

        {onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-surface font-semibold text-sm rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none min-h-[44px]"
          >
            {actionLabel || 'Show latest available'}
          </button>
        )}
      </div>
    );
  }

  // Error variant
  return (
    <div className="bg-surface rounded-xl border border-line p-6 mb-6 shadow-sm text-center space-y-4">
      <div className="w-12 h-12 bg-wrong-bg text-wrong-border rounded-full flex items-center justify-center mx-auto border border-wrong-border">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-ink mb-1">Something went wrong.</h3>
        <p className="text-sm text-muted">
          {message || 'Unable to load digest data. Please try again.'}
        </p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-surface font-semibold text-sm rounded-lg transition-colors focus:ring-2 focus:ring-focus outline-none inline-flex items-center gap-2 min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{actionLabel || 'Retry'}</span>
        </button>
      )}
    </div>
  );
}
