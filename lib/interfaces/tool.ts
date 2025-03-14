import { Schema, ToolExecutionContext, ToolDefinition, ToolResult } from '../types/tool';

// Implementation interface that extends the definition
export interface ToolProvider<TParams = unknown, TResult = unknown> extends ToolDefinition<TParams, TResult> {
  execute: (params: TParams, context: ToolExecutionContext) => Promise<ToolResult<TResult>>;
}

// Factory interface for creating tools without implementations
export interface ToolFactory {
  createToolDefinition<TParams = unknown, TResult = unknown>(
    name: string,
    schema: Schema<TParams>,
    options?: { description?: string; metadata?: Record<string, unknown> }
  ): ToolDefinition<TParams, TResult>;
}
