"use client";

import React, { ReactNode } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter
} from "@assistant-ui/react";
import { cn } from "@/lib/utils";

interface CoreRuntimeProviderProps {
  /**
   * Children to render inside the provider
   */
  children: ReactNode;

  /**
   * API endpoint for the model
   */
  endpoint?: string;

  /**
   * System instructions for the assistant
   */
  systemInstructions?: string;

  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;

  /**
   * Custom model adapter (if provided, endpoint is ignored)
   */
  customAdapter?: ChatModelAdapter;

  /**
   * Custom className for the provider container
   */
  className?: string;
}

/**
 * A simplified runtime provider that composes AssistantUI's functionality
 * Styled consistently with the application design system
 */
export function CoreRuntimeProvider({
  children,
  endpoint = "/api/chat",
  systemInstructions,
  onError,
  customAdapter,
  className
}: CoreRuntimeProviderProps) {
  // Use the provided adapter or create one with the endpoint
  const modelAdapter: ChatModelAdapter = customAdapter || {
    async run({ messages, abortSignal }) {
      try {
        // Inject system instructions if provided
        const messagesWithSystem = systemInstructions
          ? [
              {
                role: "system",
                content: systemInstructions,
                id: "system-message",
                timestamp: Date.now()
              },
              ...messages
            ]
          : messages;

        // Make the API request
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: messagesWithSystem }),
          signal: abortSignal,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        return {
          content: [
            {
              type: "text",
              text: data.content || data.text || data.message || "No content received",
            },
          ],
        };
      } catch (error) {
        // Handle aborted requests
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }

        // Call custom error handler if provided
        if (error instanceof Error && onError) {
          onError(error);
        }

        // Provide a graceful error message
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error
                ? `Error: ${error.message}`
                : "An unknown error occurred",
            },
          ],
        };
      }
    },
  };

  // Create a runtime using the model adapter
  const runtime = useLocalRuntime(modelAdapter);

  // Use AssistantUI's provider
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </div>
  );
}
