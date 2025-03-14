// Core Message service for assistant-ui integration
import { useCallback } from 'react';
import { nanoid } from 'nanoid';

// Message interfaces
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface MessageContent {
  type: 'text';
  text: string;
}

export interface MessageOptions {
  /**
   * Optional metadata to attach to the message
   */
  metadata?: Record<string, unknown>;

  /**
   * Optional ID for the message (generated if not provided)
   */
  id?: string;
}

/**
 * Creates a new message object
 */
export const createMessage = (
  role: MessageRole,
  content: string,
  options: MessageOptions = {}
): Message => {
  return {
    id: options.id || nanoid(),
    role,
    content,
    timestamp: Date.now(),
    metadata: options.metadata,
  };
};

/**
 * Creates a user message
 */
export const createUserMessage = (
  content: string,
  options: MessageOptions = {}
): Message => {
  return createMessage('user', content, options);
};

/**
 * Creates an assistant message
 */
export const createAssistantMessage = (
  content: string,
  options: MessageOptions = {}
): Message => {
  return createMessage('assistant', content, options);
};

/**
 * Creates a system message
 */
export const createSystemMessage = (
  content: string,
  options: MessageOptions = {}
): Message => {
  return createMessage('system', content, options);
};

/**
 * Formats a message for display
 */
export const formatMessageContent = (message: Message): MessageContent => {
  return {
    type: 'text',
    text: message.content,
  };
};

/**
 * Extracts plain text from message content
 */
export const extractMessageText = (content: MessageContent): string => {
  return content.text;
};

/**
 * Filters messages by role
 */
export const filterMessagesByRole = (messages: Message[], role: MessageRole): Message[] => {
  return messages.filter(message => message.role === role);
};

/**
 * Gets the last message from a list of messages
 */
export const getLastMessage = (messages: Message[]): Message | undefined => {
  return messages.length > 0 ? messages[messages.length - 1] : undefined;
};

/**
 * Gets the last user message from a list of messages
 */
export const getLastUserMessage = (messages: Message[]): Message | undefined => {
  const userMessages = filterMessagesByRole(messages, 'user');
  return getLastMessage(userMessages);
};

/**
 * Gets the last assistant message from a list of messages
 */
export const getLastAssistantMessage = (messages: Message[]): Message | undefined => {
  const assistantMessages = filterMessagesByRole(messages, 'assistant');
  return getLastMessage(assistantMessages);
};
