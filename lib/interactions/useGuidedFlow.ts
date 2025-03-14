"use client";

import { useState, useCallback } from 'react';

/**
 * This hook provides multi-step guided interactions functionality.
 *
 * Note: While Assistant UI doesn't provide this specific hook, this implementation
 * is designed to work seamlessly with Assistant UI components and follows similar design
 * patterns. It's part of the core abstraction layer that extends Assistant UI's
 * functionality without duplicating its features.
 *
 * This hook particularly complements:
 * - makeAssistantToolUI for creating guided tool UIs
 * - Assistant UI's styling system
 */

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
 * Options for the useGuidedFlow hook
 */
export interface UseGuidedFlowOptions<T> {
  /**
   * Array of steps in the flow
   */
  steps: FlowStep<T>[];

  /**
   * Initial data for the flow
   */
  initialData?: Partial<T>;

  /**
   * Callback when the flow is completed
   */
  onComplete?: (data: T) => void;

  /**
   * Start at a specific step index (defaults to 0)
   */
  initialStepIndex?: number;
}

/**
 * Return type for the useGuidedFlow hook
 */
export interface UseGuidedFlowResult<T> {
  /**
   * Current step object
   */
  currentStep: FlowStep<T>;

  /**
   * Index of the current step
   */
  currentStepIndex: number;

  /**
   * Move to the next step if validation passes
   * Returns true if successful, false if validation failed
   */
  goToNextStep: () => boolean;

  /**
   * Move to the previous step
   */
  goToPreviousStep: () => void;

  /**
   * Go to a specific step by index
   */
  goToStep: (index: number) => void;

  /**
   * Current data for the flow
   */
  data: Partial<T>;

  /**
   * Update data for the current step
   */
  updateData: (newData: Partial<T>) => void;

  /**
   * Error message from validation, if any
   */
  error: string | undefined;

  /**
   * Check if we're on the first step
   */
  isFirstStep: boolean;

  /**
   * Check if we're on the last step
   */
  isLastStep: boolean;

  /**
   * Progress as a percentage (0-100)
   */
  progress: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Reset the flow to the initial state
   */
  reset: () => void;

  /**
   * Complete the flow, triggering onComplete callback
   * Returns true if validation passes, false otherwise
   */
  complete: () => boolean;
}

/**
 * Hook for creating guided multi-step flows
 * Handles step navigation, data collection, and validation
 */
export function useGuidedFlow<T extends Record<string, unknown>>({
  steps,
  initialData = {},
  onComplete,
  initialStepIndex = 0,
}: UseGuidedFlowOptions<T>): UseGuidedFlowResult<T> {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [data, setData] = useState<Partial<T>>(initialData);
  const [error, setError] = useState<string | undefined>(undefined);

  // Calculate derived values
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const currentStep = steps[currentStepIndex];

  // Update data for the current step
  const updateData = useCallback((newData: Partial<T>) => {
    setData(prevData => ({
      ...prevData,
      ...newData,
    }));
    // Clear error when data is updated
    setError(undefined);
  }, []);

  // Validate the current step
  const validateCurrentStep = useCallback((): boolean => {
    const validation = currentStep.validate?.(data);
    if (validation) {
      setError(validation);
      return false;
    }
    setError(undefined);
    return true;
  }, [currentStep, data]);

  // Navigation methods
  const goToNextStep = useCallback((): boolean => {
    if (!validateCurrentStep()) return false;

    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [validateCurrentStep, isLastStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
      setError(undefined);
    }
  }, [isFirstStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
      setError(undefined);
    }
  }, [totalSteps]);

  // Reset the flow to initial state
  const reset = useCallback(() => {
    setCurrentStepIndex(initialStepIndex);
    setData(initialData);
    setError(undefined);
  }, [initialStepIndex, initialData]);

  // Complete the flow
  const complete = useCallback((): boolean => {
    if (!validateCurrentStep()) return false;

    // Check if we have all required data
    const isComplete = steps.every(step => {
      return !step.validate || !step.validate(data);
    });

    if (isComplete) {
      onComplete?.(data as T);
      return true;
    }

    return false;
  }, [validateCurrentStep, steps, data, onComplete]);

  return {
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    data,
    updateData,
    error,
    isFirstStep,
    isLastStep,
    progress,
    totalSteps,
    reset,
    complete,
  };
}
