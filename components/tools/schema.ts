import { Schema, ValidationError } from '@/lib/types/tool';

/**
 * A simple implementation of the Schema interface that accepts any value
 */
export function createSimpleSchema<T>(): Schema<T> {
  return {
    parse: (data: unknown): T => {
      return data as T;
    },
    safeParse: (data: unknown) => {
      return {
        success: true,
        data: data as T,
      };
    }
  };
}

/**
 * Creates a validation error
 */
export function createValidationError(message: string, path: string): ValidationError {
  return {
    errors: [
      {
        path: path.split('.'),
        message,
        field: path,
      },
    ],
    message,
  };
}
