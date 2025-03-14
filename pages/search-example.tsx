import React, { useState } from 'react';
import { SearchResults, DefaultSearchResultItem } from '@/components/custom';

// Example search result type
interface ExampleSearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  value: string;
}

// Example data
const exampleResults: ExampleSearchResult[] = [
  {
    id: '1',
    title: 'Search Result 1',
    description: 'This is the first search result with a detailed description',
    imageUrl: 'https://via.placeholder.com/50',
    value: 'Value 1'
  },
  {
    id: '2',
    title: 'Search Result 2',
    description: 'This is the second search result with a longer description to demonstrate how text wrapping works',
    value: 'Value 2'
  },
  {
    id: '3',
    title: 'Search Result 3',
    description: 'This is the third search result',
    imageUrl: 'https://via.placeholder.com/50',
    value: 'Value 3'
  },
  {
    id: '4',
    title: 'Search Result 4',
    description: 'This is the fourth search result',
    value: 'Value 4'
  },
  {
    id: '5',
    title: 'Search Result 5',
    description: 'This is the fifth search result',
    imageUrl: 'https://via.placeholder.com/50',
    value: 'Value 5'
  },
];

// Sort options
const sortOptions = [
  { label: 'Title (A-Z)', key: 'title' },
  { label: 'Description (A-Z)', key: 'description' },
];

export default function SearchExamplePage() {
  const [selectedItems, setSelectedItems] = useState<ExampleSearchResult[]>([]);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'title',
    direction: 'asc'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sort function based on selected sort option
  const sortResults = (results: ExampleSearchResult[]) => {
    return [...results].sort((a, b) => {
      const aValue = String(a[sort.key as keyof ExampleSearchResult] || '');
      const bValue = String(b[sort.key as keyof ExampleSearchResult] || '');
      const compareResult = aValue.localeCompare(bValue);
      return sort.direction === 'asc' ? compareResult : -compareResult;
    });
  };

  // Handle sort change
  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSort({ key, direction });
  };

  // Simulate loading
  const handleToggleLoading = () => {
    setIsLoading(prev => !prev);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Search Results Example</h1>

      <div className="mb-4 flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleToggleLoading}
        >
          {isLoading ? 'Stop Loading' : 'Simulate Loading'}
        </button>

        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => setSelectedItems([])}
          disabled={selectedItems.length === 0}
        >
          Clear Selection ({selectedItems.length})
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <SearchResults
          results={sortResults(exampleResults)}
          ItemComponent={DefaultSearchResultItem}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          getItemId={(item) => item.id}
          sort={sort}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          isLoading={isLoading}
          emptyMessage="No search results found"
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Selected Items:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(selectedItems, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
