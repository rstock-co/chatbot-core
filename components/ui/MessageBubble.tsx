import React from 'react';
import { Message } from '@/lib/types/message';
import { Message as AUIMessage, MessageContent, MessageContainer, MessageHeader, MessageTimestamp } from '@assistant-ui/react';
import { formatTimestamp } from '@/lib/utils/formatting';

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
 */
export function MessageBubble({ message, className, onClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <MessageContainer
      role={message.role}
      className={className}
      onClick={onClick}
      data-testid="message-bubble"
      data-message-role={message.role}
    >
      <MessageHeader>
        {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
        <MessageTimestamp>{formatTimestamp(message.timestamp)}</MessageTimestamp>
      </MessageHeader>
      <MessageContent>
        <AUIMessage role={message.role}>
          {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
        </AUIMessage>
      </MessageContent>
    </MessageContainer>
  );
}
