import React, { useRef, useEffect, ComponentType } from 'react';
import { Message, MessageRole } from '@/lib/types/message';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';

export interface MessageComponentProps {
  /**
   * The message to display
   */
  message: Message;

  /**
   * Called to send a new message
   */
  sendMessage: (content: string) => void;

  /**
   * Called to reload a message
   */
  reloadMessage?: (messageId: string) => void;
}

export interface MessageComponents {
  /**
   * Components to use based on message content type
   */
  byContentType?: Record<string, ComponentType<MessageComponentProps>>;

  /**
   * Components to use based on message role
   */
  byRole?: Record<MessageRole, ComponentType<MessageComponentProps>>;

  /**
   * Components for tool UIs
   */
  tools?: Record<string, ComponentType<unknown>>;
}

export interface RuntimeProvider {
  /**
   * Messages in the conversation
   */
  messages: Message[];

  /**
   * Append a new message
   */
  append: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;

  /**
   * Reload a message and regenerate response
   */
  reload?: (messageId: string) => Promise<void>;

  /**
   * Whether a message is being generated
   */
  isLoading: boolean;

  /**
   * Stop message generation
   */
  stop?: () => void;

  /**
   * Clear all messages
   */
  clear?: () => void;
}

export interface ThreadViewProps {
  /**
   * The runtime provider for the thread
   */
  runtime: RuntimeProvider;

  /**
   * Custom components for messages
   */
  messageComponents?: MessageComponents;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Whether to automatically scroll to new messages
   */
  automaticScrolling?: boolean;
}

/**
 * Component for displaying a chat thread with messages and composer
 */
export function ThreadView({
  runtime,
  messageComponents,
  className,
  automaticScrolling = true
}: ThreadViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (automaticScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [runtime.messages, automaticScrolling]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    await runtime.append({ role: 'user', content });
  };

  // Get the appropriate component for a message
  const getMessageComponent = (message: Message) => {
    // Check for content type match
    if (
      messageComponents?.byContentType &&
      message.metadata?.contentType &&
      typeof message.metadata.contentType === 'string' &&
      messageComponents.byContentType[message.metadata.contentType]
    ) {
      const Component = messageComponents.byContentType[message.metadata.contentType as string];
      return (
        <Component
          key={message.id}
          message={message}
          sendMessage={handleSendMessage}
          reloadMessage={runtime.reload}
        />
      );
    }

    // Check for role match
    if (
      messageComponents?.byRole &&
      messageComponents.byRole[message.role]
    ) {
      const Component = messageComponents.byRole[message.role];
      return (
        <Component
          key={message.id}
          message={message}
          sendMessage={handleSendMessage}
          reloadMessage={runtime.reload}
        />
      );
    }

    // Default to MessageBubble
    return (
      <MessageBubble
        key={message.id}
        message={message}
        onClick={() => runtime.reload?.(message.id)}
      />
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="thread-view">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {runtime.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full py-2',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {getMessageComponent(message)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <Composer
          onSubmit={handleSendMessage}
          disabled={runtime.isLoading}
          placeholder="Type a message..."
          autoFocus
        />
      </div>
    </div>
  );
}
