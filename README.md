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

# Chatbot Core Framework

A lightweight, domain-agnostic framework for building powerful conversational interfaces on top of the Assistant UI library.

## Overview

This core framework provides a set of abstractions and utilities that make it easier to build domain-specific chatbot applications without reimplementing common patterns. It composes (rather than rebuilds) the functionality from the Assistant UI library, adding thin abstraction layers that are useful for various domain applications.

## Key Features

- **Simplified Runtime Provider**: A streamlined setup for the Assistant UI runtime
- **Tool Pattern Abstractions**: Reusable patterns for common tool types like interviews and search
- **State Management**: Persistent state for chat sessions
- **Guided Interactions**: Framework for multi-step guided flows
- **Consistent Styling**: Components that seamlessly integrate with the Assistant UI design system

## Styling and Design System

All components in this core package are styled to match the Assistant UI design system:

- Uses the same color tokens and theme variables
- Consistent spacing, typography, and border styles
- Seamless visual integration with Assistant UI components

The styling leverages the Assistant UI Tailwind plugin, ensuring that all components maintain the same design language across your application.

## Core Abstractions

### Runtime Provider

The `CoreRuntimeProvider` wraps the Assistant UI's runtime with simplifications:

```tsx
import { CoreRuntimeProvider } from 'lib/core/CoreRuntimeProvider';

function App() {
  return (
    <CoreRuntimeProvider
      endpoint="/api/assistant"
      systemInstructions="You are a helpful assistant."
      onError={(error) => console.error(error)}
    >
      <YourChatInterface />
    </CoreRuntimeProvider>
  );
}
```

### Tool Patterns

#### Interview Tools

Easily create tools for guided interviews or preference collection:

```tsx
import { createInterviewTool } from 'lib/tools/createInterviewTool';

const PreferenceCollectionTool = createInterviewTool({
  toolName: "collect_preferences",
  renderQuestions: (props) => {
    // Render your custom interview questions
    return <YourQuestionUI {...props} />;
  },
  onComplete: (results) => {
    // Handle the collected data
    console.log(results);
  }
});
```

#### Search Tools

Create search interfaces with minimal boilerplate:

```tsx
import { createSearchTool } from 'lib/tools/createSearchTool';

const ProductSearchTool = createSearchTool({
  toolName: "search_products",
  performSearch: async (query, params) => {
    // Implement your search logic
    const response = await fetch(`/api/search?q=${query}`);
    return await response.json();
  }
});
```

### State Management

Persist chat state with minimal effort:

```tsx
import { useChatStatePersistence } from 'lib/hooks/useChatStatePersistence';

function ChatComponent() {
  const {
    state,
    setState,
    resetState,
    clearState,
    hasPersistedState
  } = useChatStatePersistence({
    stateId: "user-123-chat",
    initialState: { messages: [] }
  });

  // Use state in your component
}
```

### Guided Interactions

Create multi-step flows easily:

```tsx
import { GuidedInteraction } from 'components/GuidedInteraction';

function PreferenceWizard() {
  return (
    <GuidedInteraction
      title="Tell us your preferences"
      steps={[
        {
          id: "step1",
          title: "Basic Information",
          content: ({ data, updateData }) => (
            <BasicInfoForm
              data={data}
              onUpdate={updateData}
            />
          )
        },
        // Additional steps...
      ]}
      onComplete={(data) => {
        // Handle completion
      }}
    />
  );
}
```

## Integration with Assistant UI

All abstractions in this core package are designed to work seamlessly with the Assistant UI library. They leverage the built-in hooks and components while adding domain-agnostic patterns that make it easier to build specific applications.

## Design Philosophy

1. **Compose, Don't Rebuild**: We extend Assistant UI's functionality without duplicating it
2. **Thin Abstractions**: Keep abstractions lightweight and focused
3. **Domain-Agnostic**: All patterns work across domains (travel, healthcare, finance, etc.)
4. **Functional Approach**: Prefer functional patterns over class-based designs
5. **Visual Consistency**: Maintain the same design language as Assistant UI

## Getting Started

To start using this core framework in your project:

1. Set up your chatbot UI using the `CoreRuntimeProvider`
2. Create domain-specific tools using our tool abstractions
3. Manage state with the persistence hooks
4. Build guided flows using our interaction components

## License

MIT
