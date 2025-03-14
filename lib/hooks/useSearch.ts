import { useState, useCallback, useEffect, useMemo } from 'react';

export interface SearchOptions<T> {
  /**
   * Initial data to search through
   */
  initialData: T[];

  /**
   * Initial search query
   */
  initialQuery?: string;

  /**
   * Initial sort configuration
   */
  initialSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };

  /**
   * Initial page number (1-based)
   */
  initialPage?: number;

  /**
   * Number of items per page
   */
  pageSize?: number;

  /**
   * Function to determine if an item matches the search query
   */
  searchPredicate?: (item: T, query: string) => boolean;

  /**
   * Default search field names to use if searchPredicate is not provided
   */
  searchFields?: Array<keyof T>;
}

export interface SearchState<T> {
  /**
   * Current search query
   */
  query: string;

  /**
   * Current sort configuration
   */
  sort: {
    key: string;
    direction: 'asc' | 'desc';
  };

  /**
   * Current page number (1-based)
   */
  page: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Total number of filtered items
   */
  totalItems: number;

  /**
   * Current filtered and sorted items
   */
  items: T[];

  /**
   * Current filtered, sorted, and paginated items
   */
  paginatedItems: T[];

  /**
   * Whether the search is being performed
   */
  isSearching: boolean;
}

export interface SearchActions<T> {
  /**
   * Update the search query
   */
  setQuery: (query: string) => void;

  /**
   * Update the sort configuration
   */
  setSort: (key: string, direction: 'asc' | 'desc') => void;

  /**
   * Go to a specific page
   */
  goToPage: (page: number) => void;

  /**
   * Go to the next page
   */
  nextPage: () => void;

  /**
   * Go to the previous page
   */
  prevPage: () => void;

  /**
   * Refresh the search with current data
   */
  refresh: (newData?: T[]) => void;

  /**
   * Reset all search parameters to initial values
   */
  reset: () => void;
}

/**
 * Hook for managing search functionality including filtering, sorting, and pagination
 */
export function useSearch<T extends Record<string, unknown>>({
  initialData,
  initialQuery = '',
  initialSort = { key: 'id', direction: 'asc' },
  initialPage = 1,
  pageSize = 10,
  searchPredicate,
  searchFields = [],
}: SearchOptions<T>): [SearchState<T>, SearchActions<T>] {
  // State for search parameters
  const [data, setData] = useState<T[]>(initialData);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [isSearching, setIsSearching] = useState(false);

  // Default search predicate if not provided
  const defaultSearchPredicate = useCallback((item: T, searchQuery: string): boolean => {
    if (!searchQuery.trim()) return true;

    const lowercaseQuery = searchQuery.toLowerCase();

    // If searchFields are provided, only search in those fields
    if (searchFields.length > 0) {
      return searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery);
      });
    }

    // Otherwise, search in all string fields
    return Object.values(item).some(
      value => typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
    );
  }, [searchFields]);

  // Use provided predicate or default
  const effectiveSearchPredicate = searchPredicate || defaultSearchPredicate;

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    return data.filter(item => effectiveSearchPredicate(item, query));
  }, [data, query, effectiveSearchPredicate]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aValue = String(a[sort.key] || '');
      const bValue = String(b[sort.key] || '');
      const compareResult = aValue.localeCompare(bValue);

      return sort.direction === 'asc' ? compareResult : -compareResult;
    });
  }, [filteredItems, sort]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedItems.length / pageSize));
  }, [sortedItems, pageSize]);

  // Adjust page if current page is out of bounds
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Get current page items
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, page, pageSize]);

  // Action to update sort
  const handleSetSort = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSort({ key, direction });
  }, []);

  // Action to go to a specific page
  const goToPage = useCallback((newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(clampedPage);
  }, [totalPages]);

  // Action to go to the next page
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  // Action to go to the previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  // Action to refresh the search with new data
  const refresh = useCallback((newData?: T[]) => {
    setIsSearching(true);
    if (newData) {
      setData(newData);
    }
    // Simulate async search process
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  }, []);

  // Action to reset all search parameters
  const reset = useCallback(() => {
    setQuery(initialQuery);
    setSort(initialSort);
    setPage(initialPage);
    setData(initialData);
  }, [initialQuery, initialSort, initialPage, initialData]);

  // Combine state and actions
  const state: SearchState<T> = {
    query,
    sort,
    page,
    totalPages,
    totalItems: sortedItems.length,
    items: sortedItems,
    paginatedItems,
    isSearching,
  };

  const actions: SearchActions<T> = {
    setQuery,
    setSort: handleSetSort,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    reset,
  };

  return [state, actions];
}
