"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useMessage
} from "@assistant-ui/react";
import { AssistantRuntimeProvider } from "./AssistantRuntimeProvider";

/**
 * The Thread component as recommended by assistant-ui documentation
 */
export function Thread() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4" autoScroll>
        <ThreadPrimitive.Messages
          components={{
            // Using a simple component that doesn't require props
            Message: () => {
              // Use the useMessage hook to get the current message
              const message = useMessage(m => m);

              return (
                <MessagePrimitive.Root className="grid max-w-full grid-cols-[minmax(0,1fr)] gap-2 py-3">
                  <div className="col-start-1 flex items-end gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      {message.role === 'user' ? 'U' : 'A'}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <MessagePrimitive.Content />
                    </div>
                  </div>
                </MessagePrimitive.Root>
              );
            }
          }}
        />
      </ThreadPrimitive.Viewport>
      <div className="border-t p-4">
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input
            className="flex w-full resize-none rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
            placeholder="Send a message..."
          />
          <ComposerPrimitive.Send className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950">
            Send
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}

/**
 * The main chat page component that uses the Thread
 */
export function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <AssistantRuntimeProvider>
        <Thread />
      </AssistantRuntimeProvider>
    </div>
  );
}
