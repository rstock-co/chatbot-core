import React, { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { ToolDefinition } from '@/lib/types/tool';
import { Button } from '@/components/ui/button';

export interface ToolParamsProps<T = Record<string, unknown>> {
  /**
   * Current parameter values
   */
  params: T;

  /**
   * Called when parameters change
   */
  onParamsChange: (params: T) => void;

  /**
   * Whether the form is disabled
   */
  disabled?: boolean;

  /**
   * Validation errors
   */
  errors?: Record<string, string>;
}

export interface ToolResultProps<T = unknown> {
  /**
   * Result data
   */
  result: T;
}

export interface ToolRendererProps<TParams = Record<string, unknown>, TResult = unknown> {
  /**
   * Tool definition
   */
  tool: ToolDefinition<TParams, TResult>;

  /**
   * Current parameter values
   */
  params: TParams;

  /**
   * Called when parameters change
   */
  onParamsChange: (params: Partial<TParams>) => void;

  /**
   * Result of tool execution
   */
  result?: TResult;

  /**
   * Called when the tool is executed
   */
  onExecute: () => void;

  /**
   * Whether the tool is currently executing
   */
  isExecuting?: boolean;

  /**
   * Error message if execution failed
   */
  error?: string;

  /**
   * Validation errors
   */
  validationErrors?: Record<string, string>;

  /**
   * Custom component for rendering parameters
   */
  ParamsComponent?: ComponentType<ToolParamsProps<TParams>>;

  /**
   * Custom component for rendering results
   */
  ResultComponent?: ComponentType<ToolResultProps<TResult>>;

  /**
   * Additional class name
   */
  className?: string;
}

/**
 * Default component for rendering tool parameters as JSON
 */
export function DefaultParamsComponent<T>({ params, onParamsChange, disabled }: ToolParamsProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newParams = JSON.parse(e.target.value);
      onParamsChange(newParams);
    } catch {
      // Ignore invalid JSON
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <textarea
        value={JSON.stringify(params, null, 2)}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-32 font-mono text-sm p-2 border rounded"
        data-testid="tool-params-editor"
      />
    </div>
  );
}

/**
 * Default component for rendering tool results as JSON
 */
export function DefaultResultComponent<T>({ result }: ToolResultProps<T>) {
  return (
    <div className="p-4 bg-gray-50 rounded-md mt-4">
      <pre className="font-mono text-sm overflow-auto max-h-64" data-testid="tool-result-display">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Component for rendering a tool interface with parameters and results
 */
export function ToolRenderer<TParams = Record<string, unknown>, TResult = unknown>({
  tool,
  params,
  onParamsChange,
  result,
  onExecute,
  isExecuting = false,
  error,
  validationErrors,
  ParamsComponent = DefaultParamsComponent,
  ResultComponent = DefaultResultComponent,
  className
}: ToolRendererProps<TParams, TResult>) {
  return (
    <div className={cn('border rounded-lg p-4', className)} data-testid="tool-renderer">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">{tool.name}</h3>
        {tool.description && (
          <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Parameters</h4>
        <ParamsComponent
          params={params}
          onParamsChange={onParamsChange}
          disabled={isExecuting}
          errors={validationErrors}
        />
      </div>

      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md" data-testid="tool-validation-errors">
          <p className="font-medium">Validation errors:</p>
          <ul className="ml-4 list-disc">
            {Object.entries(validationErrors).map(([field, message]) => (
              <li key={field} className="text-sm mt-1">
                {field === '_general' ? message : `${field}: ${message}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <Button
          onClick={onExecute}
          disabled={isExecuting}
          isLoading={isExecuting}
          data-testid="tool-execute-button"
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md" data-testid="tool-error">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-2">
          <h4 className="text-md font-medium mb-2">Result</h4>
          <ResultComponent result={result} />
        </div>
      )}
    </div>
  );
}
