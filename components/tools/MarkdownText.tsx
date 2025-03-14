"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { TextContentPartComponent } from "@assistant-ui/react";

export const MarkdownText: TextContentPartComponent = ({ text }) => {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    return (
      <ReactMarkdown
        className="prose prose-sm max-w-none dark:prose-invert"
        components={{
          // Add custom components for markdown elements if needed
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return (
              <code className={match ? `language-${match[1]}` : ""}
                {...props}>
                {children}
              </code>
            );
          },
          a: (props) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              {...props}
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  }, [text]);

  return <div className="text-sm">{renderedContent}</div>;
};
