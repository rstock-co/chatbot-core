"use client";

import React, { useState } from 'react';
import { useGuidedFlow, FlowStep } from '../lib/interactions/useGuidedFlow';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props for the StepContent component
 */
export interface StepContentProps<T> {
  /**
   * Current step data
   */
  data: Partial<T>;

  /**
   * Update data function
   */
  updateData: (data: Partial<T>) => void;

  /**
   * Validation error, if any
   */
  validationError?: string;
}

/**
 * Props for the GuidedInteraction component
 */
export interface GuidedInteractionProps<T extends Record<string, unknown>> {
  /**
   * Title for the guided interaction
   */
  title?: string;

  /**
   * Steps in the guided flow
   */
  steps: Array<FlowStep<T> & {
    content: (props: StepContentProps<T>) => React.ReactNode;
  }>;

  /**
   * Initial data
   */
  initialData?: Partial<T>;

  /**
   * Callback when the flow is completed
   */
  onComplete?: (data: T) => void;

  /**
   * Custom component for navigation controls
   */
  navigationControls?: (props: {
    goToNextStep: () => boolean;
    goToPreviousStep: () => void;
    goToStep: (index: number) => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    completeFlow: () => boolean;
    currentStepIndex: number;
    totalSteps: number;
  }) => React.ReactNode;

  /**
   * Custom component for the completion state
   */
  completionComponent?: (data: T) => React.ReactNode;

  /**
   * Custom styles for the container
   */
  className?: string;
}

/**
 * Component for rendering a guided multi-step interaction
 * Styled to match Assistant UI design patterns
 */
export function GuidedInteraction<T extends Record<string, unknown>>({
  title,
  steps,
  initialData,
  onComplete,
  navigationControls,
  completionComponent,
  className
}: GuidedInteractionProps<T>) {
  // Track completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedData, setCompletedData] = useState<T | null>(null);

  // Setup guided flow
  const guidedFlow = useGuidedFlow<T>({
    steps,
    initialData,
    onComplete: (data) => {
      setIsCompleted(true);
      setCompletedData(data);
      if (onComplete) {
        onComplete(data);
      }
    }
  });

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    data,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep,
    validationError,
    completeFlow,
    resetFlow
  } = guidedFlow;

  // Handle restart
  const handleRestart = () => {
    setIsCompleted(false);
    setCompletedData(null);
    resetFlow();
  };

  // Get step content component
  const StepContent = steps[currentStepIndex].content;

  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  // If flow is completed and we have completion data
  if (isCompleted && completedData) {
    if (completionComponent) {
      return (
        <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
          {completionComponent(completedData)}
          <div className="mt-4">
            <Button variant="secondary" onClick={handleRestart}>
              Start Over
            </Button>
          </div>
        </div>
      );
    }

    // Default completion view
    return (
      <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
        <h2 className="text-xl font-semibold mb-4">Completed!</h2>
        <p className="mb-4">Thank you for completing all steps.</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleRestart}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // Render the guided interaction
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">
            Step {currentStepIndex + 1} of {totalSteps}: {currentStep.title}
          </span>
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        <StepContent
          data={data}
          updateData={updateData}
          validationError={validationError}
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded">
          {validationError}
        </div>
      )}

      {/* Navigation controls */}
      {navigationControls ? (
        navigationControls({
          goToNextStep,
          goToPreviousStep,
          goToStep,
          isFirstStep,
          isLastStep,
          completeFlow,
          currentStepIndex,
          totalSteps
        })
      ) : (
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button variant="default" onClick={completeFlow}>
              Complete
            </Button>
          ) : (
            <Button variant="default" onClick={goToNextStep}>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
