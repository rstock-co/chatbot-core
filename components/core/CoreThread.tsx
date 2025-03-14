"use client";

import React, { FormEventHandler } from 'react';
import {
  ThreadPrimitive,
  ComposerPrimitive,
} from '@assistant-ui/react';
import { cn } from '@/lib/utils';
import { CoreMessage } from './CoreMessage';

/**
 * Props for the CoreThread component
 */
export interface CoreThreadProps {
  /**
   * Custom class name for the thread container
   */
  className?: string;

  /**
   * Children to render inside the thread (before messages)
   */
  children?: React.ReactNode;

  /**
   * Custom class name for the composer
   */
  composerClassName?: string;

  /**
   * Placeholder for the composer input
   */
  composerPlaceholder?: string;

  /**
   * Custom submit handler that will be called when a message is submitted
   * This is passed directly to ComposerPrimitive.Root
   */
  onSubmit?: FormEventHandler<HTMLFormElement>;

  /**
   * Whether the thread should automatically scroll to the bottom on new messages
   */
  autoScroll?: boolean;
}

/**
 * A thread component that directly uses Assistant UI primitives
 */
export function CoreThread({
  className,
  children,
  composerClassName,
  composerPlaceholder = "Type a message...",
  onSubmit,
  autoScroll = true
}: CoreThreadProps) {
  return (
    <ThreadPrimitive.Root className={cn("flex h-full flex-col", className)}>
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto" autoScroll={autoScroll}>
        {children}

        <ThreadPrimitive.Messages
          components={{
            Message: CoreMessage
          }}
        />
      </ThreadPrimitive.Viewport>

      <div className="border-t p-4">
        <ComposerPrimitive.Root onSubmit={onSubmit}>
          <div className="flex w-full items-end gap-2">
            <ComposerPrimitive.Input
              className={cn(
                "flex w-full resize-none rounded-md border bg-background px-3 py-2 ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                composerClassName
              )}
              placeholder={composerPlaceholder}
            />

            <ComposerPrimitive.Send className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              Send
            </ComposerPrimitive.Send>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
