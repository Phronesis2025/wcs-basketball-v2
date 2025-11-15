// src/components/registration/StepIndicator.tsx
import React from "react";

type Step = 1 | 2 | 3;

interface StepIndicatorProps {
  currentStep: Step;
  completedSteps: Set<number>;
  skipParentStep: boolean;
}

export default function StepIndicator({
  currentStep,
  completedSteps,
  skipParentStep,
}: StepIndicatorProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-8">
      {[1, 2, 3].map((step) => {
        if (skipParentStep && step === 1) return null;
        const stepNum = skipParentStep ? step - 1 : step;
        const isActive = stepNum === currentStep;
        // Only mark as completed if the step has actually been completed (moved past)
        const isCompleted = completedSteps.has(stepNum);

        return (
          <div
            key={step}
            className={`
              flex items-center gap-2 flex-1
              ${
                isActive
                  ? "text-[red]"
                  : isCompleted
                  ? "text-green-500"
                  : "text-gray-400"
              }
            `}
          >
            {/* Wrapper for pulsing background effect */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Pulsing background behind active step - larger than circle for visibility */}
              {isActive && (
                <div
                  className="absolute w-12 h-12 -left-2 -top-2 rounded-full bg-[#FF0000] step-pulse"
                  style={{ zIndex: 0 }}
                ></div>
              )}
              {/* Step circle */}
              <div
                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300
                  ${
                    isActive
                      ? "bg-[#FF0000] text-white"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }
                `}
                style={{ zIndex: 10 }}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
            </div>
            <span className="text-sm md:text-base">
              {step === 1
                ? "Parent Info"
                : step === 2
                ? "Player Info"
                : "Review"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

