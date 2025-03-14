import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ComposerProps {
  /**
   * Handler for when a message is submitted
   */
  onSubmit: (content: string) => void;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;

  /**
   * Whether the input is disabled
   */
  disabled?: boolean;

  /**
   * Initial content for the input
   */
  initialContent?: string;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Whether to auto-focus the input
   */
  autoFocus?: boolean;

  /**
   * Maximum number of rows to show
   */
  maxRows?: number;

  /**
   * Whether to submit on pressing Enter (without shift)
   */
  submitOnEnter?: boolean;
}

/**
 * Composer component for typing and sending messages
 */
export function Composer({
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  initialContent = '',
  className,
  autoFocus = true,
  maxRows = 5,
  submitOnEnter = true
}: ComposerProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Reset content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height (min of scrollHeight or maxRows height)
    const lineHeight = 24; // Approximate line height in pixels
    const maxHeight = maxRows * lineHeight;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
  };

  // Handle key press (submit on Enter without Shift)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (disabled || !content.trim()) return;

    onSubmit(content.trim());
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className={cn('flex flex-col', className)} data-testid="composer">
      <div className="flex items-end gap-2 p-2 border rounded-lg bg-white">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 p-2 resize-none overflow-y-hidden',
            'outline-none border-none focus:ring-0',
            'placeholder:text-gray-400 text-gray-900',
            'min-h-[40px]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ height: 'auto' }}
          rows={1}
          data-testid="composer-input"
        />

        <Button
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
          className="flex-shrink-0"
          size="sm"
          aria-label="Send message"
          data-testid="composer-submit"
        >
          Send
        </Button>
      </div>

      {submitOnEnter && (
        <div className="text-xs text-gray-500 mt-1 ml-2">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded border">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded border">Shift</kbd> +{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded border">Enter</kbd> for new line
        </div>
      )}
    </div>
  );
}
