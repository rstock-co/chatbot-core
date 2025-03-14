import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface SearchResultItemProps<T = unknown> {
  /**
   * The result data
   */
  item: T;

  /**
   * Whether this item is selected
   */
  isSelected: boolean;

  /**
   * Called when the item selection state changes
   */
  onSelect: (selected: boolean) => void;

  /**
   * Index of the item in the results
   */
  index: number;
}

export interface DefaultSearchResultItemProps<T = unknown> extends SearchResultItemProps<T> {
  /**
   * Property to use for the item's title
   */
  titleProperty?: keyof T;

  /**
   * Property to use for the item's description
   */
  descriptionProperty?: keyof T;

  /**
   * Property to use for the item's image URL
   */
  imageProperty?: keyof T;

  /**
   * Property to use for the item's price or value
   */
  valueProperty?: keyof T;

  /**
   * Format function for the value
   */
  formatValue?: (value: unknown) => string;

  /**
   * Format function for the description
   */
  formatDescription?: (description: unknown) => string;

  /**
   * Additional className
   */
  className?: string;
}

/**
 * A search result item component with assistant-ui styling
 */
export function DefaultSearchResultItem<T = unknown>({
  item,
  isSelected,
  onSelect,
  titleProperty = 'title' as keyof T,
  descriptionProperty = 'description' as keyof T,
  imageProperty = 'image' as keyof T,
  valueProperty = 'value' as keyof T,
  formatValue = (value) => String(value),
  formatDescription = (description) => String(description),
  className = '',
}: DefaultSearchResultItemProps<T>) {
  const title = item[titleProperty];
  const description = item[descriptionProperty];
  const imageUrl = item[imageProperty];
  const value = item[valueProperty];

  const handleToggleSelect = () => {
    onSelect(!isSelected);
  };

  return (
    <div
      className={cn(
        "flex items-center p-4 border rounded-lg mb-2 hover:bg-gray-50 transition-colors",
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
        className
      )}
      data-testid="search-result-item"
    >
      <div className="mr-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggleSelect}
          aria-label={`Select ${String(title)}`}
          className="h-5 w-5"
        />
      </div>

      {imageUrl && (
        <div className="mr-4 flex-shrink-0">
          <img
            src={String(imageUrl)}
            alt={String(title)}
            className="h-16 w-16 object-cover rounded"
          />
        </div>
      )}

      <div className="flex-grow min-w-0">
        {title && (
          <h3 className="text-lg font-medium text-gray-900 truncate">{String(title)}</h3>
        )}

        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {formatDescription(description)}
          </p>
        )}
      </div>

      {value !== undefined && (
        <div className="ml-4 text-lg font-semibold text-gray-900">
          {formatValue(value)}
        </div>
      )}

      <div className="ml-4">
        <Button
          variant={isSelected ? "outline" : "default"}
          size="sm"
          onClick={handleToggleSelect}
        >
          {isSelected ? 'Deselect' : 'Select'}
        </Button>
      </div>
    </div>
  );
}
