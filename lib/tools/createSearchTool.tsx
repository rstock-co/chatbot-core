"use client";

import React from 'react';
import { makeAssistantToolUI } from "@assistant-ui/react";
import { cn } from "@/lib/utils";

/**
 * Generic search result item
 */
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

/**
 * Configuration for creating a search tool
 */
interface SearchToolConfig<T extends SearchResultItem, P extends Record<string, unknown>> {
  /**
   * Name of the tool
   */
  toolName: string;

  /**
   * Component to render a search result item
   */
  renderResultItem?: (props: {
    item: T;
    isSelected: boolean;
    onSelect: (item: T) => void;
  }) => React.ReactNode;

  /**
   * Component to render when loading
   */
  renderLoading?: () => React.ReactNode;

  /**
   * Component to render when no results
   */
  renderEmpty?: (props: { query: string }) => React.ReactNode;

  /**
   * Search implementation function
   */
  performSearch: (query: string, params: P) => Promise<T[]>;
}

/**
 * Creates a reusable search tool by composing AssistantUI's makeAssistantToolUI
 * Styled to match the application's design system
 */
export function createSearchTool<T extends SearchResultItem, P extends Record<string, unknown> = Record<string, unknown>>({
  toolName,
  renderResultItem,
  renderLoading,
  renderEmpty,
  performSearch
}: SearchToolConfig<T, P>) {
  // Return a tool UI component using AssistantUI's makeAssistantToolUI
  return makeAssistantToolUI<
    { query: string } & P,
    { selectedItem?: T }
  >({
    toolName,
    render: ({ args, result, addResult }) => {
      // Create a rendering component that uses hooks properly
      const SearchResults = () => {
        // Track selected item
        const [selectedItem, setSelectedItem] = React.useState<T | null>(null);

        // Track search results
        const [results, setResults] = React.useState<T[]>([]);
        const [isLoading, setIsLoading] = React.useState(true);

        // Handle selection
        const handleSelect = (item: T) => {
          setSelectedItem(item);
          addResult({ selectedItem: item });
        };

        // Call the search implementation
        React.useEffect(() => {
          let isMounted = true;

          const doSearch = async () => {
            setIsLoading(true);
            try {
              // Extract the query and other args
              const { query, ...searchParams } = args;
              const searchResults = await performSearch(query, searchParams as P);

              if (isMounted) {
                setResults(searchResults);
                setIsLoading(false);
              }
            } catch (error) {
              if (isMounted) {
                console.error('Search failed:', error);
                setResults([]);
                setIsLoading(false);
              }
            }
          };

          doSearch();

          return () => {
            isMounted = false;
          };
        }, [args]);

        // If we have a result, show it
        if (result?.selectedItem) {
          return (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="font-medium text-primary">Selected: {result.selectedItem.title}</p>
            </div>
          );
        }

        // Loading state
        if (isLoading) {
          if (renderLoading) {
            return renderLoading();
          }

          return (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p>Searching for &quot;{args.query}&quot;...</p>
              <div className="mt-2 animate-pulse h-4 bg-muted rounded w-3/4"></div>
              <div className="mt-1 animate-pulse h-4 bg-muted rounded w-1/2"></div>
            </div>
          );
        }

        // Empty state
        if (results.length === 0) {
          if (renderEmpty) {
            return renderEmpty({ query: args.query });
          }

          return (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground">No results found for &quot;{args.query}&quot;</p>
            </div>
          );
        }

        // Results
        return (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="font-medium mb-2">Results for &quot;{args.query}&quot;</h3>
            <div className="space-y-2">
              {results.map(item => {
                const isSelected = selectedItem?.id === item.id;

                // Use custom item renderer if provided
                if (renderResultItem) {
                  return (
                    <React.Fragment key={item.id}>
                      {renderResultItem({
                        item,
                        isSelected,
                        onSelect: handleSelect
                      })}
                    </React.Fragment>
                  );
                }

                // Default item renderer
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 border rounded cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleSelect(item)}
                  >
                    <h4 className="font-medium">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      };

      return <SearchResults />;
    }
  });
}
