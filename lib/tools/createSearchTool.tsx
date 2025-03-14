"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import React from "react";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchToolConfig<T extends SearchResult = SearchResult> {
  /**
   * The name of the search tool, which will be used in the UI and for the Assistant to call it
   */
  toolName: string;

  /**
   * Function to perform the actual search
   * @param query The search query provided by the assistant
   * @returns Promise resolving to an array of search results
   */
  searchFunction: (query: string) => Promise<T[]>;

  /**
   * Custom renderer for search results (optional)
   * If not provided, a default renderer will be used
   */
  renderResults?: (results: T[]) => React.ReactNode;

  /**
   * Custom renderer for a single search result (optional)
   * If not provided, a default renderer will be used
   */
  renderResult?: (result: T) => React.ReactNode;
}

/**
 * Creates a search tool that can be used with the Assistant UI
 * This is a lightweight abstraction over makeAssistantToolUI that provides
 * sensible defaults for search-related tools
 */
export function createSearchTool<T extends SearchResult = SearchResult>({
  toolName,
  searchFunction,
  renderResults,
  renderResult,
}: SearchToolConfig<T>) {
  return makeAssistantToolUI<{ query: string }, T[]>({
    toolName,
    render: function SearchTool({ args, addResult }) {
      const { query } = args as { query: string };
      const [results, setResults] = React.useState<T[]>([]);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState<string | null>(null);

      React.useEffect(() => {
        const fetchResults = async () => {
          try {
            setLoading(true);
            const searchResults = await searchFunction(query);
            setResults(searchResults);
            addResult(searchResults); // Pass results back to the assistant
          } catch (err) {
            setError(err instanceof Error ? err.message : "Search failed");
          } finally {
            setLoading(false);
          }
        };

        fetchResults();
      }, [query, addResult]);

      // Show loading state
      if (loading) {
        return (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Searching for: {query}</span>
          </div>
        );
      }

      // Show error state
      if (error) {
        return (
          <div className="text-red-500 py-2">
            Error: {error}
          </div>
        );
      }

      // Show results using custom renderer if provided
      if (renderResults) {
        return renderResults(results);
      }

      // Default results renderer
      return (
        <div className="space-y-4 py-2">
          <h3 className="text-sm font-medium">Search results for: {query}</h3>
          {results.length === 0 ? (
            <p className="text-gray-500">No results found</p>
          ) : (
            <div className="grid gap-3">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-3">
                  {renderResult ? (
                    renderResult(result)
                  ) : (
                    <>
                      <h4 className="font-medium">{result.title}</h4>
                      {result.description && <p className="text-sm text-gray-500">{result.description}</p>}
                      {result.imageUrl && (
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="mt-2 rounded-md max-h-32 object-cover"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  });
}
