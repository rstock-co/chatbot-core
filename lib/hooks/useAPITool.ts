import { useState, useCallback, useRef } from 'react';
import { ToolProvider } from '../interfaces/tool';
import { ToolResult, ValidationError } from '../types/tool';

export interface APIConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  rateLimitDelay?: number;
}

export interface UseAPIToolOptions<TParams, TResult> {
  /**
   * Name of the tool
   */
  name: string;

  /**
   * Description of what the tool does
   */
  description: string;

  /**
   * API configuration
   */
  apiConfig: APIConfig;

  /**
   * Transformer function to convert tool parameters to API request
   */
  paramsToRequest: (params: TParams) => {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    queryParams?: Record<string, string | number | boolean>;
  };

  /**
   * Transformer function to convert API response to tool result
   */
  responseToResult: (response: unknown) => TResult;

  /**
   * Validate parameters
   */
  validateParams: (params: unknown) => TParams;

  /**
   * Event callbacks
   */
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number, error: Error) => void;
  onRateLimit?: (delay: number) => void;
}

export interface UseAPIToolReturn<TParams, TResult> {
  /**
   * The constructed tool provider
   */
  tool: ToolProvider<TParams, TResult>;

  /**
   * Execute the API call directly
   */
  executeAPI: (params: TParams) => Promise<TResult>;

  /**
   * The last result from the API
   */
  lastResult: TResult | null;

  /**
   * The last error from the API
   */
  lastError: Error | null;

  /**
   * Whether the API is currently loading
   */
  isLoading: boolean;

  /**
   * Reset the state
   */
  reset: () => void;
}

/**
 * Hook for creating API-based tools
 * Provides a domain-agnostic implementation with robust handling of
 * common API patterns like retries, rate limiting, and error handling
 */
export function useAPITool<TParams extends Record<string, unknown>, TResult>({
  name,
  description,
  apiConfig,
  paramsToRequest,
  responseToResult,
  validateParams,
  onSuccess,
  onError,
  onRetry,
  onRateLimit,
}: UseAPIToolOptions<TParams, TResult>): UseAPIToolReturn<TParams, TResult> {
  const [lastResult, setLastResult] = useState<TResult | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use ref for the abort controller to cancel requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeAPI = useCallback(async (params: TParams): Promise<TResult> => {
    setIsLoading(true);
    setLastError(null);

    // Create a new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Get request details from params
    const { endpoint, method = 'GET', data, queryParams } = paramsToRequest(params);

    // Build URL with query parameters
    let url = `${apiConfig.baseURL}${endpoint}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Set up fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...apiConfig.headers,
      },
      signal: abortControllerRef.current.signal,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Handle retry logic
    const maxRetries = apiConfig.retryAttempts || 0;
    const retryDelay = apiConfig.retryDelay || 1000;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        // Make the API call
        const response = await fetch(url, fetchOptions);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '0', 10) * 1000;
          const delay = retryAfter || apiConfig.rateLimitDelay || 5000;

          onRateLimit?.(delay);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Handle general errors
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Parse and transform the response
        const responseData = await response.json();
        const result = responseToResult(responseData);

        setLastResult(result);
        setIsLoading(false);
        onSuccess?.(result);

        return result;
      } catch (error) {
        // Don't retry if aborted
        if (error instanceof Error && error.name === 'AbortError') {
          setIsLoading(false);
          throw error;
        }

        attempt++;

        // If we've exhausted all retries, throw the error
        if (attempt > maxRetries) {
          const finalError = error instanceof Error ? error : new Error(String(error));
          setLastError(finalError);
          setIsLoading(false);
          onError?.(finalError);
          throw finalError;
        }

        // Otherwise retry after delay
        onRetry?.(attempt, error instanceof Error ? error : new Error(String(error)));
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    // We should never reach here due to the throw in the catch block
    throw new Error('Unexpected error in API call');
  }, [apiConfig, paramsToRequest, responseToResult, onSuccess, onError, onRetry, onRateLimit]);

  const reset = useCallback(() => {
    setLastResult(null);
    setLastError(null);
    setIsLoading(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Create the tool provider
  const tool: ToolProvider<TParams, TResult> = {
    name,
    description,
    parameters: {
      parse: validateParams,
      safeParse: (data: unknown) => {
        try {
          const validatedParams = validateParams(data);
          return { success: true, data: validatedParams };
        } catch (error) {
          // Create a ValidationError-compatible object
          const validationError: ValidationError = {
            errors: [{
              path: ['unknown'],
              message: error instanceof Error ? error.message : String(error)
            }],
            message: error instanceof Error ? error.message : String(error)
          };
          return {
            success: false,
            error: validationError
          };
        }
      }
    },
    execute: async (params: TParams, context): Promise<ToolResult<TResult>> => {
      try {
        const result = await executeAPI(params);
        return {
          data: result,
          metadata: {
            completedAt: Date.now(),
            toolCallId: context.toolCallId
          }
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            error: error.message,
            errorDetails: {
              code: 'API_ERROR',
              details: { message: error.message },
              suggestions: ['Check your connection', 'Try again later']
            }
          };
        }
        return { error: String(error) };
      }
    },
  };

  return {
    tool,
    executeAPI,
    lastResult,
    lastError,
    isLoading,
    reset,
  };
}
