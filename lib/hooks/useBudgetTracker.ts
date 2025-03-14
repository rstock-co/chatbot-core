import { useState, useCallback, useMemo } from 'react';

export interface Expense {
  /**
   * Unique identifier for the expense
   */
  id: string;

  /**
   * Expense amount
   */
  amount: number;

  /**
   * Category of expense (e.g., 'flight', 'hotel', 'activity')
   */
  category: string;

  /**
   * Optional details about the expense
   */
  details?: Record<string, unknown>;
}

export interface UseBudgetTrackerOptions {
  /**
   * Initial budget amount
   */
  initialBudget?: number;

  /**
   * Callback when budget changes
   */
  onBudgetChange?: (budget: number) => void;

  /**
   * Callback when expense is added
   */
  onExpenseAdded?: (expense: Expense) => void;

  /**
   * Callback when expense is removed
   */
  onExpenseRemoved?: (id: string) => void;
}

export interface UseBudgetTrackerResult {
  /**
   * Current budget amount
   */
  budget: number;

  /**
   * Set the budget amount
   */
  setBudget: (amount: number) => void;

  /**
   * All expenses by category
   */
  expenses: Record<string, Expense[]>;

  /**
   * Add a new expense
   */
  addExpense: (category: string, amount: number, id: string, details?: Record<string, unknown>) => void;

  /**
   * Update an existing expense
   */
  updateExpense: (category: string, id: string, amount: number, details?: Record<string, unknown>) => void;

  /**
   * Remove an expense
   */
  removeExpense: (category: string, id: string) => void;

  /**
   * Remove all expenses in a category
   */
  removeAllInCategory: (category: string) => void;

  /**
   * Total of all expenses
   */
  totalExpenses: number;

  /**
   * Total expenses by category
   */
  categoryTotals: Record<string, number>;

  /**
   * Remaining budget (budget - totalExpenses)
   */
  remainingBudget: number;

  /**
   * Whether expenses are within budget
   */
  isWithinBudget: boolean;

  /**
   * Check if a category has reached a limit
   */
  hasReachedLimit: (category: string, limit?: number) => boolean;

  /**
   * Reset budget and expenses
   */
  resetBudget: () => void;

  /**
   * Percentage of total by category
   */
  categoryPercentages: Record<string, number>;

  /**
   * Get cheapest options from a list
   */
  getCheapestOptions: <T extends Record<string, unknown>>(
    options: T[],
    priceField: keyof T,
    count: number
  ) => T[];
}

/**
 * Hook for tracking budget and expenses
 */
export function useBudgetTracker({
  initialBudget = 0,
  onBudgetChange,
  onExpenseAdded,
  onExpenseRemoved
}: UseBudgetTrackerOptions = {}): UseBudgetTrackerResult {
  const [budget, setBudgetState] = useState<number>(initialBudget);
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({});

  // Set budget with callback
  const setBudget = useCallback((amount: number) => {
    setBudgetState(amount);
    onBudgetChange?.(amount);
  }, [onBudgetChange]);

  // Add a new expense
  const addExpense = useCallback((
    category: string,
    amount: number,
    id: string,
    details?: Record<string, unknown>
  ) => {
    const expense: Expense = {
      id,
      amount,
      category,
      details
    };

    setExpenses(prev => {
      const categoryExpenses = prev[category] || [];
      return {
        ...prev,
        [category]: [...categoryExpenses, expense]
      };
    });

    onExpenseAdded?.(expense);
  }, [onExpenseAdded]);

  // Update an existing expense
  const updateExpense = useCallback((
    category: string,
    id: string,
    amount: number,
    details?: Record<string, unknown>
  ) => {
    setExpenses(prev => {
      const categoryExpenses = prev[category] || [];
      const updatedExpenses = categoryExpenses.map(expense =>
        expense.id === id
          ? { ...expense, amount, details: details ?? expense.details }
          : expense
      );

      return {
        ...prev,
        [category]: updatedExpenses
      };
    });
  }, []);

  // Remove an expense
  const removeExpense = useCallback((category: string, id: string) => {
    setExpenses(prev => {
      const categoryExpenses = prev[category] || [];
      const filteredExpenses = categoryExpenses.filter(expense => expense.id !== id);

      const newExpenses = { ...prev };

      if (filteredExpenses.length > 0) {
        newExpenses[category] = filteredExpenses;
      } else {
        delete newExpenses[category];
      }

      return newExpenses;
    });

    onExpenseRemoved?.(id);
  }, [onExpenseRemoved]);

  // Remove all expenses in a category
  const removeAllInCategory = useCallback((category: string) => {
    setExpenses(prev => {
      const newExpenses = { ...prev };

      if (newExpenses[category]) {
        // Call onExpenseRemoved for each expense in the category
        newExpenses[category].forEach(expense => {
          onExpenseRemoved?.(expense.id);
        });

        delete newExpenses[category];
      }

      return newExpenses;
    });
  }, [onExpenseRemoved]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return Object.values(expenses).reduce(
      (total, categoryExpenses) => total + categoryExpenses.reduce(
        (categoryTotal, expense) => categoryTotal + expense.amount,
        0
      ),
      0
    );
  }, [expenses]);

  // Calculate total expenses by category
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    Object.entries(expenses).forEach(([category, categoryExpenses]) => {
      totals[category] = categoryExpenses.reduce(
        (total, expense) => total + expense.amount,
        0
      );
    });

    return totals;
  }, [expenses]);

  // Calculate remaining budget
  const remainingBudget = useMemo(() => {
    return budget - totalExpenses;
  }, [budget, totalExpenses]);

  // Check if within budget
  const isWithinBudget = useMemo(() => {
    return totalExpenses <= budget;
  }, [totalExpenses, budget]);

  // Check if a category has reached a limit
  const hasReachedLimit = useCallback((category: string, limit?: number) => {
    if (!limit || limit <= 0) return false;

    const categoryTotal = categoryTotals[category] || 0;
    return categoryTotal >= limit;
  }, [categoryTotals]);

  // Reset budget and expenses
  const resetBudget = useCallback(() => {
    setBudgetState(initialBudget);
    setExpenses({});
    onBudgetChange?.(initialBudget);
  }, [initialBudget, onBudgetChange]);

  // Calculate percentage of total by category
  const categoryPercentages = useMemo(() => {
    const percentages: Record<string, number> = {};

    if (totalExpenses > 0) {
      Object.entries(categoryTotals).forEach(([category, total]) => {
        percentages[category] = (total / totalExpenses) * 100;
      });
    }

    return percentages;
  }, [categoryTotals, totalExpenses]);

  // Get cheapest options from a list
  const getCheapestOptions = useCallback(<T extends Record<string, unknown>>(
    options: T[],
    priceField: keyof T,
    count: number
  ): T[] => {
    return [...options]
      .sort((a, b) => {
        const aPrice = typeof a[priceField] === 'number' ? a[priceField] as number : 0;
        const bPrice = typeof b[priceField] === 'number' ? b[priceField] as number : 0;
        return aPrice - bPrice;
      })
      .slice(0, count);
  }, []);

  return {
    budget,
    setBudget,
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    removeAllInCategory,
    totalExpenses,
    categoryTotals,
    remainingBudget,
    isWithinBudget,
    hasReachedLimit,
    resetBudget,
    categoryPercentages,
    getCheapestOptions
  };
}
