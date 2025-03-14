import React, { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { SearchResultItemProps, DefaultSearchResultItem } from './search-result-item';
import { Button } from "@/components/ui/button";

export interface SearchResultsProps<T = unknown> {
  /**
   * Search results to display
   */
  results: T[];

  /**
   * Item component for rendering each result
   */
  ItemComponent?: React.ComponentType<SearchResultItemProps<T>>;

  /**
   * Currently selected items
   */
  selectedItems?: T[];

  /**
   * Called when items are selected/deselected
   */
  onSelectionChange?: (items: T[]) => void;

  /**
   * Function to identify unique items (defaults to index)
   */
  getItemId?: (item: T, index: number) => string | number;

  /**
   * Sorting configuration
   */
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
  };

  /**
   * Called when sort changes
   */
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;

  /**
   * Available sort options
   */
  sortOptions?: Array<{
    label: string;
    key: string;
  }>;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Additional className
   */
  className?: string;
}

/**
 * A search results component with assistant-ui styling
 */
export function SearchResults<T = unknown>({
  results,
  ItemComponent = DefaultSearchResultItem,
  selectedItems = [],
  onSelectionChange,
  getItemId = (_item: T, index: number) => index,
  sort,
  onSortChange,
  sortOptions = [],
  isLoading = false,
  emptyMessage = 'No results found',
  error,
  className = '',
}: SearchResultsProps<T>) {
  // Internal selection state if not controlled
  const [internalSelectedItems, setInternalSelectedItems] = useState<T[]>([]);

  // Use either controlled or internal selection
  const effectiveSelectedItems = onSelectionChange ? selectedItems : internalSelectedItems;

  // Check if an item is selected
  const isItemSelected = useCallback((item: T, index: number) => {
    const itemId = getItemId(item, index);
    return effectiveSelectedItems.some((selectedItem, selectedIndex) =>
      getItemId(selectedItem, selectedIndex) === itemId
    );
  }, [effectiveSelectedItems, getItemId]);

  // Handle item selection
  const handleItemSelect = useCallback((item: T, index: number, selected: boolean) => {
    const newSelectedItems = selected
      ? [...effectiveSelectedItems, item]
      : effectiveSelectedItems.filter((selectedItem, selectedIndex) =>
          getItemId(selectedItem, selectedIndex) !== getItemId(item, index)
        );

    if (onSelectionChange) {
      onSelectionChange(newSelectedItems);
    } else {
      setInternalSelectedItems(newSelectedItems);
    }
  }, [effectiveSelectedItems, getItemId, onSelectionChange]);

  // Handle sort change
  const handleSortChange = useCallback((key: string) => {
    if (!onSortChange) return;

    const direction = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(key, direction);
  }, [sort, onSortChange]);

  // Select all items
  const handleSelectAll = useCallback(() => {
    const newSelectedItems = [...results];
    if (onSelectionChange) {
      onSelectionChange(newSelectedItems);
    } else {
      setInternalSelectedItems(newSelectedItems);
    }
  }, [results, onSelectionChange]);

  // Deselect all items
  const handleDeselectAll = useCallback(() => {
    if (onSelectionChange) {
      onSelectionChange([]);
    } else {
      setInternalSelectedItems([]);
    }
  }, [onSelectionChange]);

  return (
    <div className={cn("space-y-4", className)} data-testid="search-results">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {results.length} results {effectiveSelectedItems.length > 0 && `(${effectiveSelectedItems.length} selected)`}
        </div>

        <div className="flex space-x-2">
          {sortOptions.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                className="text-sm border rounded p-1"
                value={sort?.key || ''}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label} {sort?.key === option.key && (sort.direction === 'asc' ? '↑' : '↓')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {results.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={effectiveSelectedItems.length === results.length}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={effectiveSelectedItems.length === 0}
              >
                Deselect All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && results.length === 0 && !error && (
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      )}

      {/* Results list */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((item, index) => (
            <ItemComponent
              key={String(getItemId(item, index))}
              item={item}
              index={index}
              isSelected={isItemSelected(item, index)}
              onSelect={(selected) => handleItemSelect(item, index, selected)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
