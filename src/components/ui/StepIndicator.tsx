'use client';

import { STEP_LABELS } from '@/lib/constants';

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {STEP_LABELS.slice(0, 5).map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < currentStep
                    ? 'bg-[var(--color-brand)] text-white'
                    : i === currentStep
                    ? 'bg-[var(--color-brand)] text-white ring-2 ring-purple-300'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i <= currentStep ? 'text-stone-700' : 'text-stone-400'}`}>
                {label}
              </span>
            </div>
            {i < 4 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-1 ${
                  i < currentStep ? 'bg-[var(--color-brand)]' : 'bg-stone-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
