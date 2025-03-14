// Message types for the chat application
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>; // Extension point for future additions
}

export interface MessageWithStatus extends Message {
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

export function createMessage(
  role: MessageRole,
  content: string,
  overrides: Partial<Omit<Message, 'role' | 'content'>> = {}
): Message {
  return {
    id: overrides.id ?? generateId(),
    role,
    content,
    timestamp: overrides.timestamp ?? Date.now(),
    ...(overrides.metadata ? { metadata: overrides.metadata } : {}),
  };
}

// Simple ID generator - in a real implementation, you might use UUID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export { createMessage as createMessageObject }; // Export with alias for backward compatibility
