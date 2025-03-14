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

## How This Framework Uses Assistant UI

This framework **does not duplicate** Assistant UI functionality. Instead, it:

1. **Directly Uses Assistant UI Components** where available:
   - Uses `ThreadPrimitive`, `MessagePrimitive`, and `ComposerPrimitive` for chat interfaces
   - Uses `makeAssistantToolUI` for creating tool UIs
   - Uses `useLocalRuntime` and `AssistantRuntimeProvider` for the chatbot runtime

2. **Extends with Complementary Components** where Assistant UI doesn't provide them:
   - Adds persistence layer with `useChatStatePersistence`
   - Adds guided interaction flows with `useGuidedFlow` and `GuidedInteraction`
   - Adds common tool patterns with `createSearchTool` and `createInterviewTool`

3. **Maintains Styling Consistency** with the Assistant UI theme:
   - Uses the same color tokens and variables
   - Follows the same component design patterns
   - Components look and feel like native Assistant UI components

## Key Features

- **Simplified Runtime Provider**: A streamlined setup for the Assistant UI runtime
- **Tool Pattern Abstractions**: Reusable patterns for common tool types like interviews and search
- **State Management**: Persistent state for chat sessions
- **Guided Interactions**: Framework for multi-step guided flows
- **Consistent Styling**: Components that seamlessly integrate with the Assistant UI design system

## Styling and Design System

All components in this core package are styled to match the Assistant UI design system:

- Uses the same color tokens and theme variables (primary, secondary, muted, etc.)
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

# Assistant UI Core Package

This package provides a thin abstraction layer on top of Assistant UI, offering domain-agnostic components and hooks that simplify implementation of AI assistants while fully leveraging the official Assistant UI framework.

## Overview

This core package:
- Composes and extends Assistant UI's components and hooks
- Provides domain-agnostic abstractions that simplify common patterns
- Follows functional programming principles
- Maintains compatibility with Assistant UI's design system

## Core Components

### CoreRuntimeProvider

A simplified runtime provider that wraps Assistant UI's `AssistantRuntimeProvider`:

```tsx
import { CoreRuntimeProvider } from '@/lib/core/CoreRuntimeProvider';

export default function ChatPage() {
  return (
    <CoreRuntimeProvider
      endpoint="/api/assistant"
      systemInstructions="You are a helpful assistant."
    >
      <CoreThread />
    </CoreRuntimeProvider>
  );
}
```

### CoreThread and CoreMessage

Domain-agnostic thread components that use Assistant UI primitives:

```tsx
import { CoreThread } from '@/components/core/CoreThread';

export default function ChatInterface() {
  return (
    <CoreThread
      className="h-full"
      composerPlaceholder="Type a message..."
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const message = formData.get('message') as string;
        // Process message
      }}
    />
  );
}
```

## Tool Abstractions

### createInterviewTool

Create domain-agnostic interview/questionnaire tools:

```tsx
import { createInterviewTool } from '@/lib/tools/createInterviewTool';

// Define your questions
const questions = [
  { id: 'name', question: 'What is your name?' },
  { id: 'age', question: 'How old are you?' }
];

// Create the interview tool
const ProfileCollectionTool = createInterviewTool({
  toolName: 'collect_profile_info',
  renderQuestions: ({ questions, onComplete }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onComplete({
        name: formData.get('name'),
        age: formData.get('age'),
      });
    }}>
      {questions.map(q => (
        <div key={q.id}>
          <label>{q.question}</label>
          <input name={q.id} />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  )
});
```

### createSearchTool

Create domain-agnostic search tools:

```tsx
import { createSearchTool } from '@/lib/tools/createSearchTool';

// Create the search tool
const ProductSearchTool = createSearchTool({
  toolName: 'search_products',
  searchFunction: async (query) => {
    // Implement your search logic
    const response = await fetch(`/api/products?q=${query}`);
    const data = await response.json();
    return data.products.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      imageUrl: p.image,
      metadata: { price: p.price }
    }));
  }
});
```

## Hooks and Utilities

### useGuidedFlow

A custom hook for creating multi-step guided interactions:

```tsx
import { useGuidedFlow } from '@/lib/interactions/useGuidedFlow';

function MultiStepForm() {
  const {
    currentStep,
    data,
    updateData,
    goToNextStep,
    goToPreviousStep,
    error,
    isFirstStep,
    isLastStep,
    progress
  } = useGuidedFlow({
    steps: [
      {
        id: 'personal',
        title: 'Personal Information',
        validate: (data) => {
          if (!data.name) return 'Name is required';
          return undefined;
        }
      },
      {
        id: 'preferences',
        title: 'Your Preferences',
      }
    ],
    onComplete: (data) => {
      console.log('Flow completed with data:', data);
    }
  });

  return (
    <div>
      <h2>{currentStep.title}</h2>
      <ProgressBar value={progress} />

      {currentStep.id === 'personal' && (
        <input
          value={data.name || ''}
          onChange={e => updateData({ name: e.target.value })}
        />
      )}

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex gap-2">
        {!isFirstStep && (
          <button onClick={goToPreviousStep}>Back</button>
        )}

        {!isLastStep ? (
          <button onClick={goToNextStep}>Next</button>
        ) : (
          <button onClick={complete}>Finish</button>
        )}
      </div>
    </div>
  );
}
```

## Extending the Core Package

This package is designed to be extended for domain-specific use cases. When building upon it:

1. Use the provided abstractions rather than creating custom implementations
2. For domain-specific features, create separate components that utilize these abstractions
3. Maintain compatibility with the Assistant UI's design system
4. Follow functional programming principles

## Requirements

- Next.js 13+ (App Router)
- React 18+
- TypeScript 4.9+
- Assistant UI package
- Tailwind CSS
