import React from 'react';
import { Message } from '@/lib/types/message';
import { formatTimestamp } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  /**
   * The message to display
   */
  message: Message;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Called when the message is clicked
   */
  onClick?: () => void;
}

/**
 * A component for displaying individual chat messages
 * Styled to match Assistant UI design patterns
 */
export function MessageBubble({ message, className, onClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={cn(
        "relative flex w-full max-w-3xl py-4 px-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      onClick={onClick}
      data-testid="message-bubble"
      data-message-role={message.role}
    >
      <div className={cn(
        "flex flex-col gap-1 rounded-lg p-3",
        isUser
          ? "bg-primary text-primary-foreground"
          : isSystem
            ? "bg-muted text-muted-foreground"
            : "bg-card border shadow-sm"
      )}>
        {/* Message header */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
          </span>
          <span className="text-xs opacity-70">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Message content */}
        <div className="mt-1 whitespace-pre-wrap break-words">
          {typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content)
          }
        </div>
      </div>
    </div>
  );
}
