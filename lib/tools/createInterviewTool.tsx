"use client";

import React from 'react';
import { makeAssistantToolUI } from "@assistant-ui/react";

/**
 * Configuration for creating an interview tool
 */
interface InterviewToolConfig<QuestionType, ResultType> {
  /**
   * Name of the tool
   */
  toolName: string;

  /**
   * Component to render the questions UI
   */
  renderQuestions: (props: {
    questions: QuestionType[];
    onComplete: (result: ResultType) => void;
    currentStep?: number;
  }) => React.ReactNode;

  /**
   * Component to render after answers are submitted
   */
  renderComplete?: (result: ResultType) => React.ReactNode;
}

/**
 * Creates a reusable interview tool by composing AssistantUI's makeAssistantToolUI
 * Styled to match the application's design system
 */
export function createInterviewTool<QuestionType, ResultType>({
  toolName,
  renderQuestions,
  renderComplete
}: InterviewToolConfig<QuestionType, ResultType>) {
  return makeAssistantToolUI<{ questions: QuestionType[] }, ResultType>({
    toolName,
    render: ({ args, result, addResult }) => {
      // If we have a result and a custom complete renderer, use it
      if (result && renderComplete) {
        return renderComplete(result);
      }

      // If we have a result but no custom renderer, show a simple completion message
      if (result) {
        return (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-primary font-medium">Information collected successfully!</p>
          </div>
        );
      }

      // Otherwise render the interview questions
      return renderQuestions({
        questions: args.questions,
        onComplete: (data) => addResult(data)
      });
    }
  });
}
