"use client";

import { ReactNode } from "react";
import { AssistantRuntimeProvider, useLocalRuntime, type ChatModelAdapter } from "@assistant-ui/react";

// Domain-agnostic model adapter
const ModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    // Connect to your AI provider (OpenAI, Anthropic, etc.)
    const result = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: abortSignal,
    });

    const data = await result.json();
    return data;
  },
};

export function MyRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const runtime = useLocalRuntime(ModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
