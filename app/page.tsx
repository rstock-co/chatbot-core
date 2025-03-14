"use client";

import { Thread } from "@/components/assistant-ui/thread";

export default function Home() {
  return (
    <div className="flex h-screen flex-col p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Domain-Agnostic AI Assistant</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <Thread />
      </main>
    </div>
  );
}
