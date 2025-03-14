"use client";

import { ReactNode } from "react";
import {
  AssistantRuntimeProvider as AUIRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";

/**
 * A model adapter that connects to our own API
 */
const customModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    try {
      // We'll need to implement an API endpoint for this
      const result = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortSignal,
      });

      if (!result.ok) {
        throw new Error(`API request failed with status ${result.status}`);
      }

      const data = await result.json();

      return {
        content: [
          {
            type: "text",
            text: data.content,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw error;
        }
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
      };
    }
  },
};

export function AssistantRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Create a runtime using our custom model adapter
  const runtime = useLocalRuntime(customModelAdapter);

  return (
    <AUIRuntimeProvider runtime={runtime}>
      {children}
    </AUIRuntimeProvider>
  );
}
