'use client';

import { Fragment } from 'react';
import { STEP_LABELS } from '@/lib/constants';

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = STEP_LABELS.slice(0, 5);

  return (
    <div
      className="w-full max-w-md mx-auto px-6 pt-2 pb-6"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={currentStep + 1}
      aria-valuetext={steps[currentStep]}
    >
      <div className="flex items-center justify-center">
        {steps.map((label, i) => (
          <Fragment key={label}>
            {i > 0 && (
              <div
                className={`flex-1 h-[2px] mx-1.5 rounded-full transition-colors duration-300 ${
                  i <= currentStep ? 'bg-[#0066FF]' : 'bg-stone-200'
                }`}
              />
            )}
            {i === currentStep ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#0066FF] shadow-sm whitespace-nowrap">
                {label}
              </span>
            ) : i < currentStep ? (
              <span className="w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center shrink-0" aria-hidden="true">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-stone-200 shrink-0" aria-hidden="true" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
