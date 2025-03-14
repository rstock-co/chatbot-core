import { useState, useCallback } from 'react';
import { ToolDefinition, ToolExecutionContext } from '../types/tool';

export interface UseAssistantToolOptions<TParams, TResult> {
  /**
   * The tool definition
   */
  tool: ToolDefinition<TParams, TResult>;

  /**
   * Initial parameter values
   */
  initialParams?: Partial<TParams>;

  /**
   * Callback when execution starts
   */
  onExecutionStart?: (params: TParams) => void;

  /**
   * Callback when execution completes successfully
   */
  onExecutionComplete?: (result: TResult) => void;

  /**
   * Callback when execution fails
   */
  onExecutionError?: (error: Error) => void;
}

export interface UseAssistantToolResult<TParams, TResult> {
  /**
   * The tool definition
   */
  tool: ToolDefinition<TParams, TResult>;

  /**
   * Current parameter values
   */
  params: Partial<TParams>;

  /**
   * Set parameter values
   */
  setParams: (params: Partial<TParams>) => void;

  /**
   * Update a single parameter value
   */
  updateParam: <K extends keyof TParams>(key: K, value: TParams[K]) => void;

  /**
   * Execute the tool with current parameters
   */
  execute: (context?: Partial<ToolExecutionContext>) => Promise<TResult | undefined>;

  /**
   * Result of the last execution
   */
  result: TResult | null;

  /**
   * Whether the tool is currently executing
   */
  isExecuting: boolean;

  /**
   * Error from the last execution, if any
   */
  error: Error | null;

  /**
   * Validation errors from current parameters, if any
   */
  validationErrors: Record<string, string> | null;

  /**
   * Validate current parameters
   */
  validateParams: () => boolean;

  /**
   * Reset parameters and results
   */
  reset: () => void;
}

/**
 * Hook for integrating assistant tools with your UI
 */
export function useAssistantTool<TParams = Record<string, unknown>, TResult = unknown>({
  tool,
  initialParams = {},
  onExecutionStart,
  onExecutionComplete,
  onExecutionError
}: UseAssistantToolOptions<TParams, TResult>): UseAssistantToolResult<TParams, TResult> {
  const [params, setParams] = useState<Partial<TParams>>(initialParams);
  const [result, setResult] = useState<TResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

  // Helper to update a single parameter
  const updateParam = useCallback(<K extends keyof TParams>(key: K, value: TParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Validate parameters
  const validateParams = useCallback((): boolean => {
    try {
      // Clear previous validation errors
      setValidationErrors(null);

      // Use the tool's schema to validate parameters
      const result = tool.parameters.safeParse(params);

      if (!result.success && result.error) {
        // Convert validation errors to a record format
        const errors = result.error.errors.reduce((acc, err) => {
          const field = err.field || err.path.join('.');
          acc[field] = err.message;
          return acc;
        }, {} as Record<string, string>);

        setValidationErrors(errors);
        return false;
      }

      return true;
    } catch (err) {
      // Handle unexpected validation errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown validation error';
      setValidationErrors({ '_general': errorMessage });
      return false;
    }
  }, [tool.parameters, params]);

  // Execute the tool
  const execute = useCallback(async (context?: Partial<ToolExecutionContext>): Promise<TResult | undefined> => {
    // Clear previous results and errors
    setResult(null);
    setError(null);

    // Validate parameters before execution
    if (!validateParams()) {
      return undefined;
    }

    setIsExecuting(true);

    try {
      // Use tool's schema to parse and validate parameters
      const validParams = tool.parameters.parse(params) as TParams;

      // Call the execution start callback
      onExecutionStart?.(validParams);

      // Execute the tool with the validated parameters
      const executionContext: ToolExecutionContext = {
        toolCallId: context?.toolCallId || `call-${Date.now()}`,
        abortSignal: context?.abortSignal,
        timeoutMs: context?.timeoutMs
      };

      const execResult = await tool.execute(validParams, executionContext);

      if (execResult.error) {
        throw new Error(execResult.error);
      }

      if (execResult.data) {
        setResult(execResult.data as TResult);
        onExecutionComplete?.(execResult.data as TResult);
        return execResult.data as TResult;
      }

      return undefined;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onExecutionError?.(errorObj);
      return undefined;
    } finally {
      setIsExecuting(false);
    }
  }, [tool, params, validateParams, onExecutionStart, onExecutionComplete, onExecutionError]);

  // Reset all state
  const reset = useCallback(() => {
    setParams(initialParams);
    setResult(null);
    setIsExecuting(false);
    setError(null);
    setValidationErrors(null);
  }, [initialParams]);

  return {
    tool,
    params,
    setParams,
    updateParam,
    execute,
    result,
    isExecuting,
    error,
    validationErrors,
    validateParams,
    reset
  };
}
