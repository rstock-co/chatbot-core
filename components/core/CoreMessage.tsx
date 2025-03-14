"use client";

import { useMessage, MessagePrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";

/**
 * Props for the CoreMessage component
 */
export interface CoreMessageProps {
  /**
   * Optional additional class name
   */
  className?: string;
}

/**
 * A message component that uses Assistant UI's primitives directly.
 * This is designed to be used with ThreadPrimitive.Messages:
 *
 * ```tsx
 * <ThreadPrimitive.Messages
 *   components={{ Message: CoreMessage }}
 * />
 * ```
 */
export function CoreMessage({ className }: CoreMessageProps) {
  // Get message data using Assistant UI's hook
  const message = useMessage(m => m);
  const isUser = message.role === 'user';

  return (
    <MessagePrimitive.Root
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-3 py-4",
        className
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
        isUser ? "bg-primary/10" : "bg-muted"
      )}>
        {isUser ? 'U' : 'A'}
      </div>

      {/* Message content */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium leading-none">
          {isUser ? 'You' : 'Assistant'}
        </div>

        <div className="prose prose-sm dark:prose-invert mt-1">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}
