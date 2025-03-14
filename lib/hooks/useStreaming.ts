import { useState, useCallback } from 'react';

interface UseStreamingOptions {
  /**
   * Initial content to display
   */
  initialContent?: string;

  /**
   * Called when streaming starts
   */
  onStart?: () => void;

  /**
   * Called when a token is appended
   */
  onToken?: (token: string) => void;

  /**
   * Called when streaming completes
   */
  onComplete?: (fullContent: string) => void;

  /**
   * Called when streaming encounters an error
   */
  onError?: (error: Error) => void;
}

interface UseStreamingResult {
  /**
   * Current streaming content
   */
  content: string;

  /**
   * Whether content is currently streaming
   */
  isStreaming: boolean;

  /**
   * Start streaming content
   */
  startStream: () => void;

  /**
   * Append a token to the content
   */
  appendToken: (token: string) => void;

  /**
   * Complete the streaming process
   */
  completeStream: () => void;

  /**
   * Reset the streaming content
   */
  resetStream: () => void;

  /**
   * Set an error state for the stream
   */
  errorStream: (error: Error) => void;
}

/**
 * Hook for managing streaming content like typing indicators and AI responses
 */
export function useStreaming({
  initialContent = '',
  onStart,
  onToken,
  onComplete,
  onError
}: UseStreamingOptions = {}): UseStreamingResult {
  const [content, setContent] = useState(initialContent);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback(() => {
    setIsStreaming(true);
    setContent(initialContent);
    onStart?.();
  }, [initialContent, onStart]);

  const appendToken = useCallback((token: string) => {
    if (!isStreaming) return;

    setContent(prev => prev + token);
    onToken?.(token);
  }, [isStreaming, onToken]);

  const completeStream = useCallback(() => {
    if (!isStreaming) return;

    setIsStreaming(false);
    onComplete?.(content);
  }, [isStreaming, content, onComplete]);

  const resetStream = useCallback(() => {
    setContent(initialContent);
    setIsStreaming(false);
  }, [initialContent]);

  const errorStream = useCallback((error: Error) => {
    setIsStreaming(false);
    onError?.(error);
  }, [onError]);

  return {
    content,
    isStreaming,
    startStream,
    appendToken,
    completeStream,
    resetStream,
    errorStream
  };
}
