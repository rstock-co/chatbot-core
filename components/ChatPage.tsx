"use client";

import { Thread } from "./AssistantUI";
import { AssistantRuntimeProvider } from "./AssistantRuntimeProvider";

export function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <AssistantRuntimeProvider>
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </AssistantRuntimeProvider>
    </div>
  );
}
