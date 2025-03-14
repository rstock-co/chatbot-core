/**
 * Represents a schema for validating tool parameters.
 *
 * In a production environment, you would typically use a schema validation
 * library like Zod. This interface provides a generic structure that could
 * be implemented with various validation libraries.
 */
export interface Schema<T = any> {
  /**
   * Validates and transforms the input data according to the schema.
   * @param data The data to validate
   * @returns The validated and transformed data
   * @throws Error if validation fails
   */
  parse(data: unknown): T;

  /**
   * Validates the input data and returns a result object instead of throwing.
   * @param data The data to validate
   * @returns An object containing either the validated data or validation errors
   */
  safeParse(data: unknown): { success: boolean; data?: T; error?: ValidationError };
}

/**
 * Represents a validation error from a schema validation.
 */
export interface ValidationError {
  /** Array of individual error details */
  errors: Array<{
    /** Path to the field with the error */
    path: string[];
    /** Error message */
    message: string;
    /** Field name */
    field?: string;
  }>;

  /** Returns the formatted error message */
  message: string;
}

/**
 * The result of a tool execution.
 * Generic type T represents the successful result data type.
 */
export interface ToolResult<T = any> {
  /** The successful result data, if the tool execution succeeded */
  data?: T;

  /** Error message if the tool execution failed */
  error?: string;

  /** Additional error details, if available */
  errorDetails?: {
    /** Error code for programmatic handling */
    code?: string;
    /** Technical details about the error */
    details?: Record<string, any>;
    /** Suggested actions to resolve the error */
    suggestions?: string[];
  };

  /** Metadata about the tool execution */
  metadata?: {
    /** Duration of the tool execution in milliseconds */
    durationMs?: number;
    /** Timestamp when the tool execution completed */
    completedAt?: number;
    /** Any additional metadata specific to the tool */
    [key: string]: any;
  };
}

/**
 * Parameters that must be passed to a tool execution.
 * This is kept separate from any tool-specific parameters.
 */
export interface ToolExecutionContext {
  /** Unique identifier for the tool execution request */
  toolCallId: string;

  /** Signal that can be used to abort the tool execution */
  abortSignal?: AbortSignal;

  /** Optional timeout in milliseconds after which the tool execution should abort */
  timeoutMs?: number;
}

/**
 * Describes the definition of a tool that can be called by an AI assistant.
 *
 * @typeparam TParams The type of parameters the tool accepts
 * @typeparam TResult The type of result the tool returns
 */
export interface ToolDefinition<TParams = any, TResult = any> {
  /** Unique name of the tool */
  name: string;

  /** Human-readable description of what the tool does */
  description: string;

  /** Schema for validating the tool's parameters */
  parameters: Schema<TParams>;

  /** Schema for the expected return value (optional, for documentation) */
  returnType?: Schema<TResult>;

  /** Whether the tool is currently available for use */
  isAvailable?: boolean;

  /** Additional metadata about the tool */
  metadata?: Record<string, any>;

  /**
   * Executes the tool with the given parameters
   * @param params Parameters for tool execution
   * @param context Execution context with toolCallId, etc.
   * @returns A promise resolving to the tool result
   */
  execute(params: TParams, context: ToolExecutionContext): Promise<ToolResult<TResult>>;
}
