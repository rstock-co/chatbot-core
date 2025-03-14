import { useCallback } from 'react';
import { Schema, ToolDefinition } from '../types/tool';

export function useToolFactory() {
  const createToolDefinition = useCallback(<TParams = unknown, TResult = unknown>(
    name: string,
    schema: Schema<TParams>,
    options?: { description?: string; metadata?: Record<string, unknown> }
  ): ToolDefinition<TParams, TResult> => {
    return {
      name,
      description: options?.description || `Tool: ${name}`,
      parameters: schema,
      metadata: options?.metadata,
      // Add a placeholder execute method that will be overridden by the actual implementation
      execute: async () => {
        throw new Error('Tool execution not implemented');
      },
    };
  }, []);

  return { createToolDefinition };
}
