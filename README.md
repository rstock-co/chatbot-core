This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project.

## Getting Started

First, add your OpenAI API key to `.env.local` file:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

# Search Results Component

A modern, reusable search results component built with React and TypeScript. This component provides a clean and intuitive interface for displaying search results with features like selection, sorting, and custom item rendering.

## Features

- 🔍 Display search results with customizable item rendering
- ✅ Select and deselect individual items or all items at once
- 🔄 Sort results with customizable sort options
- 🎨 Fully customizable styling with Tailwind CSS
- 📱 Responsive design for all screen sizes
- 🔄 Loading, empty, and error states
- 🧩 Functional programming approach

## Components

### SearchResults

The main component for displaying search results.

```tsx
import { SearchResults, DefaultSearchResultItem } from '@/components/custom';

// Example usage
<SearchResults
  results={data}
  ItemComponent={DefaultSearchResultItem}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  getItemId={(item) => item.id}
  sort={{ key: 'title', direction: 'asc' }}
  onSortChange={handleSortChange}
  sortOptions={[
    { label: 'Title (A-Z)', key: 'title' },
    { label: 'Date', key: 'date' }
  ]}
  isLoading={isLoading}
  emptyMessage="No results found"
/>
```

### DefaultSearchResultItem

A default item renderer for search results.

```tsx
import { DefaultSearchResultItem } from '@/components/custom';

// Example usage
<DefaultSearchResultItem
  item={item}
  index={index}
  isSelected={isSelected}
  onSelect={handleSelect}
/>
```

## Props

### SearchResults Props

| Prop                | Type                                                | Description                             |
| ------------------- | --------------------------------------------------- | --------------------------------------- |
| `results`           | `T[]`                                               | Array of search results                 |
| `ItemComponent`     | `React.ComponentType<SearchResultItemProps<T>>`     | Component to render each result item    |
| `selectedItems`     | `T[]`                                               | Array of selected items                 |
| `onSelectionChange` | `(items: T[]) => void`                              | Callback when selection changes         |
| `getItemId`         | `(item: T, index: number) => string \| number`      | Function to get unique ID for each item |
| `sort`              | `{ key: string; direction: 'asc' \| 'desc' }`       | Current sort configuration              |
| `onSortChange`      | `(key: string, direction: 'asc' \| 'desc') => void` | Callback when sort changes              |
| `sortOptions`       | `Array<{ label: string; key: string; }>`            | Available sort options                  |
| `isLoading`         | `boolean`                                           | Whether results are loading             |
| `emptyMessage`      | `string`                                            | Message to display when no results      |
| `error`             | `string`                                            | Error message to display                |
| `className`         | `string`                                            | Additional CSS class                    |

### SearchResultItem Props

| Prop         | Type                          | Description                            |
| ------------ | ----------------------------- | -------------------------------------- |
| `item`       | `T`                           | The result item data                   |
| `index`      | `number`                      | Index of the item in the results array |
| `isSelected` | `boolean`                     | Whether the item is selected           |
| `onSelect`   | `(selected: boolean) => void` | Callback when selection changes        |

## Example

See the `pages/search-example.tsx` file for a complete example of how to use the SearchResults component.

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Run the development server
npm run dev
```
