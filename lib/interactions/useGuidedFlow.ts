"use client";

import { useState, useCallback, useMemo } from 'react';

/**
 * Defines a single step in a guided flow
 */
export interface FlowStep<T> {
  /**
   * Unique identifier for this step
   */
  id: string;

  /**
   * Title of the step
   */
  title: string;

  /**
   * Optional validation function for this step
   * Returns undefined if valid, or an error message if invalid
   */
  validate?: (data: Partial<T>) => string | undefined;
}

/**
 * Configuration for the guided flow
 */
export interface GuidedFlowConfig<T> {
  /**
   * Array of steps in the flow
   */
  steps: FlowStep<T>[];

  /**
   * Initial data (optional)
   */
  initialData?: Partial<T>;

  /**
   * Callback when flow is completed
   */
  onComplete?: (data: T) => void;
}

/**
 * Result of the useGuidedFlow hook
 */
export interface GuidedFlowResult<T> {
  /**
   * Current step index
   */
  currentStepIndex: number;

  /**
   * Current step object
   */
  currentStep: FlowStep<T>;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Current data
   */
  data: Partial<T>;

  /**
   * Update data for current step
   */
  updateData: (newData: Partial<T>) => void;

  /**
   * Go to next step (validates current step first)
   * Returns true if successful, false if validation failed
   */
  goToNextStep: () => boolean;

  /**
   * Go to previous step
   */
  goToPreviousStep: () => void;

  /**
   * Go to a specific step by index
   */
  goToStep: (index: number) => void;

  /**
   * Check if current step is the first step
   */
  isFirstStep: boolean;

  /**
   * Check if current step is the last step
   */
  isLastStep: boolean;

  /**
   * Current validation error (if any)
   */
  validationError: string | undefined;

  /**
   * Complete the flow (validates current step first)
   * Returns true if successful, false if validation failed
   */
  completeFlow: () => boolean;

  /**
   * Reset the flow to the beginning
   */
  resetFlow: () => void;
}

/**
 * Hook for creating multi-step guided interactions
 */
export function useGuidedFlow<T extends Record<string, unknown>>({
  steps,
  initialData = {} as Partial<T>,
  onComplete
}: GuidedFlowConfig<T>): GuidedFlowResult<T> {
  // State for current step index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // State for data
  const [data, setData] = useState<Partial<T>>(initialData);

  // State for validation error
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  // Get current step
  const currentStep = useMemo(() => steps[currentStepIndex], [steps, currentStepIndex]);

  // Calculate derived values
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Update data for current step
  const updateData = useCallback((newData: Partial<T>) => {
    setData(prevData => ({ ...prevData, ...newData }));
    setValidationError(undefined);
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const { validate } = currentStep;

    if (validate) {
      const error = validate(data);
      setValidationError(error);
      return !error;
    }

    return true;
  }, [currentStep, data]);

  // Go to next step
  const goToNextStep = useCallback((): boolean => {
    if (!validateCurrentStep()) {
      return false;
    }

    if (!isLastStep) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      return true;
    }

    return false;
  }, [validateCurrentStep, isLastStep]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
      setValidationError(undefined);
    }
  }, [isFirstStep]);

  // Go to specific step
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
      setValidationError(undefined);
    }
  }, [totalSteps]);

  // Complete flow
  const completeFlow = useCallback((): boolean => {
    if (!validateCurrentStep()) {
      return false;
    }

    if (onComplete) {
      onComplete(data as T);
    }

    return true;
  }, [validateCurrentStep, onComplete, data]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setCurrentStepIndex(0);
    setData(initialData);
    setValidationError(undefined);
  }, [initialData]);

  return {
    currentStepIndex,
    currentStep,
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
  };
}
