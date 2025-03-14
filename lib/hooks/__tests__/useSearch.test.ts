import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

const testData = [
  { id: '1', name: 'Apple', category: 'Fruit', price: 1.99 },
  { id: '2', name: 'Banana', category: 'Fruit', price: 0.99 },
  { id: '3', name: 'Carrot', category: 'Vegetable', price: 0.50 },
  { id: '4', name: 'Potato', category: 'Vegetable', price: 0.75 },
  { id: '5', name: 'Orange', category: 'Fruit', price: 1.50 },
  { id: '6', name: 'Broccoli', category: 'Vegetable', price: 1.25 },
  { id: '7', name: 'Grapes', category: 'Fruit', price: 2.50 },
  { id: '8', name: 'Tomato', category: 'Vegetable', price: 1.80 },
  { id: '9', name: 'Kiwi', category: 'Fruit', price: 2.00 },
  { id: '10', name: 'Cucumber', category: 'Vegetable', price: 1.20 },
];

describe('useSearch', () => {
  it('should initialize with provided data and default parameters', () => {
    const { result } = renderHook(() => useSearch({ initialData: testData }));
    const [state] = result.current;

    expect(state.query).toBe('');
    expect(state.sort).toEqual({ key: 'id', direction: 'asc' });
    expect(state.page).toBe(1);
    expect(state.totalItems).toBe(10);
    expect(state.items.length).toBe(10);
    expect(state.paginatedItems.length).toBe(10);
    expect(state.isSearching).toBe(false);
  });

  it('should filter items based on search query', () => {
    const { result } = renderHook(() => useSearch({
      initialData: testData,
      searchFields: ['name', 'category']
    }));

    // Test searching for "fruit" in the category field
    act(() => {
      const [, actions] = result.current;
      actions.setQuery('fruit');
    });

    const [state] = result.current;
    expect(state.items.length).toBe(4); // Should find all fruits
    expect(state.items.every(item => item.category === 'Fruit')).toBe(true);

    // Test searching for "a" in the name field
    act(() => {
      const [, actions] = result.current;
      actions.setQuery('a');
    });

    const [newState] = result.current;
    expect(newState.items.length).toBe(5); // Should find items with "a" in the name
  });

  it('should sort items based on sort configuration', () => {
    const { result } = renderHook(() => useSearch({
      initialData: testData,
      initialSort: { key: 'price', direction: 'asc' }
    }));

    // Check initial ascending sort by price
    let [state] = result.current;
    expect(state.items[0].price).toBe(0.50); // Cheapest item first
    expect(state.items[state.items.length - 1].price).toBe(2.50); // Most expensive item last

    // Test changing to descending sort
    act(() => {
      const [, actions] = result.current;
      actions.setSort('price', 'desc');
    });

    [state] = result.current;
    expect(state.items[0].price).toBe(2.50); // Most expensive item first
    expect(state.items[state.items.length - 1].price).toBe(0.50); // Cheapest item last

    // Test sorting by a different field
    act(() => {
      const [, actions] = result.current;
      actions.setSort('name', 'asc');
    });

    [state] = result.current;
    expect(state.items[0].name).toBe('Apple'); // Alphabetically first
    expect(state.items[state.items.length - 1].name).toBe('Tomato'); // Alphabetically last
  });

  it('should paginate results correctly', () => {
    const { result } = renderHook(() => useSearch({
      initialData: testData,
      pageSize: 3
    }));

    // Check initial pagination
    let [state] = result.current;
    expect(state.totalPages).toBe(4); // 10 items with 3 per page = 4 pages
    expect(state.paginatedItems.length).toBe(3);
    expect(state.paginatedItems[0].id).toBe('1');

    // Test going to next page
    act(() => {
      const [, actions] = result.current;
      actions.nextPage();
    });

    [state] = result.current;
    expect(state.page).toBe(2);
    expect(state.paginatedItems.length).toBe(3);
    expect(state.paginatedItems[0].id).toBe('4');

    // Test going to a specific page
    act(() => {
      const [, actions] = result.current;
      actions.goToPage(4);
    });

    [state] = result.current;
    expect(state.page).toBe(4);
    expect(state.paginatedItems.length).toBe(1); // Last page has only 1 item
    expect(state.paginatedItems[0].id).toBe('10');

    // Test going to previous page
    act(() => {
      const [, actions] = result.current;
      actions.prevPage();
    });

    [state] = result.current;
    expect(state.page).toBe(3);
    expect(state.paginatedItems.length).toBe(3);
  });

  it('should handle custom search predicate', () => {
    // Custom predicate that finds items with price within a range
    const customPredicate = (item: any, query: string) => {
      if (!query.trim()) return true;
      const [min, max] = query.split('-').map(parseFloat);
      if (isNaN(min) || isNaN(max)) return false;
      return item.price >= min && item.price <= max;
    };

    const { result } = renderHook(() => useSearch({
      initialData: testData,
      searchPredicate: customPredicate
    }));

    // Search for items with price between 1.00 and 2.00
    act(() => {
      const [, actions] = result.current;
      actions.setQuery('1.00-2.00');
    });

    const [state] = result.current;
    expect(state.items.length).toBe(6); // Should find items with price between 1.00 and 2.00
    expect(state.items.every(item => item.price >= 1.00 && item.price <= 2.00)).toBe(true);
  });

  it('should refresh with new data', () => {
    const { result } = renderHook(() => useSearch({ initialData: testData.slice(0, 5) }));

    // Initial state has 5 items
    let [state] = result.current;
    expect(state.items.length).toBe(5);

    // Refresh with full data
    act(() => {
      const [, actions] = result.current;
      actions.refresh(testData);
    });

    // Wait for the simulated async process
    jest.advanceTimersByTime(300);

    [state] = result.current;
    expect(state.items.length).toBe(10);
    expect(state.isSearching).toBe(false);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useSearch({
      initialData: testData,
      initialQuery: 'apple',
      initialSort: { key: 'name', direction: 'asc' },
      initialPage: 1
    }));

    // Change various parameters
    act(() => {
      const [, actions] = result.current;
      actions.setQuery('banana');
      actions.setSort('price', 'desc');
      actions.goToPage(2);
    });

    // Verify parameters were changed
    let [state] = result.current;
    expect(state.query).toBe('banana');
    expect(state.sort).toEqual({ key: 'price', direction: 'desc' });
    expect(state.page).toBe(2);

    // Reset to initial state
    act(() => {
      const [, actions] = result.current;
      actions.reset();
    });

    // Verify parameters were reset
    [state] = result.current;
    expect(state.query).toBe('apple');
    expect(state.sort).toEqual({ key: 'name', direction: 'asc' });
    expect(state.page).toBe(1);
  });

  it('should adjust page number when items are filtered', () => {
    const { result } = renderHook(() => useSearch({
      initialData: testData,
      pageSize: 3,
      initialPage: 3
    }));

    // Initial state is page 3
    let [state] = result.current;
    expect(state.page).toBe(3);

    // Filter to only 2 items (which means only 1 page of results)
    act(() => {
      const [, actions] = result.current;
      actions.setQuery('app'); // Should only find Apple from the test data
    });

    // Page should be adjusted to 1 since there's now only 1 page
    [state] = result.current;
    expect(state.items.length).toBe(1);
    expect(state.totalPages).toBe(1);
    expect(state.page).toBe(1);
  });
});
