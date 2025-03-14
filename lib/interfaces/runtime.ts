import { Message } from '../types/message';

export interface RuntimeOptions {
  /**
   * Initial messages to populate the chat
   */
  initialMessages?: Message[];

  /**
   * Extension point for additional options
   */
  [key: string]: unknown;
}

export interface RuntimeEvents {
  /**
   * Fired when a new token is received during streaming
   */
  onToken?: (token: string) => void;

  /**
   * Fired when a message starts being generated
   */
  onMessageStart?: (message: Message) => void;

  /**
   * Fired when a message is complete
   */
  onMessageComplete?: (message: Message) => void;

  /**
   * Fired when an error occurs
   */
  onError?: (error: Error) => void;
}

export type StreamingOptions = {
  /**
   * Enable streaming of the response
   */
  enabled?: boolean;

  /**
   * Event handlers for streaming events
   */
  events?: RuntimeEvents;
};

export interface RuntimeProvider {
  /**
   * Current messages in the chat
   */
  messages: Message[];

  /**
   * Add a new message to the chat
   * @param message The message to add
   * @param options Options for the message, including streaming
   */
  append: (
    message: Omit<Message, 'id' | 'timestamp'>,
    options?: StreamingOptions
  ) => Promise<void>;

  /**
   * Reload a specific message and generate a new response
   * @param messageId ID of the message to reload
   * @param options Options for the reload operation
   */
  reload?: (messageId: string, options?: StreamingOptions) => Promise<void>;

  /**
   * Stop the current generation
   */
  stop?: () => void;

  /**
   * Whether the runtime is currently loading/generating
   */
  isLoading: boolean;

  /**
   * The current streaming state, if supported
   */
  streaming?: {
    /**
     * Whether a response is currently streaming
     */
    isStreaming: boolean;

    /**
     * The partial content of the current streaming message
     */
    partialMessage: string;
  };

  /**
   * Clear all messages
   */
  clear?: () => void;

  /**
   * Get the thread identifier, if applicable
   */
  threadId?: string;

  /**
   * Extension point for future additions
   */
  [key: string]: unknown;
}
