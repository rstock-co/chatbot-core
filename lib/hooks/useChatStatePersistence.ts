"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Configuration for chat state persistence
 */
export interface ChatStatePersistenceConfig<T> {
  /**
   * Unique identifier for this chat state
   */
  stateId: string;

  /**
   * Initial state value
   */
  initialState: T;

  /**
   * Storage mechanism to use (defaults to localStorage if available)
   * Pass null for no persistence (memory only)
   */
  storage?: Storage | null;

  /**
   * Prefix for storage keys (defaults to 'chat_state_')
   */
  keyPrefix?: string;
}

/**
 * Result of the useChatStatePersistence hook
 */
export interface ChatStatePersistenceResult<T> {
  /**
   * Current state value
   */
  state: T;

  /**
   * Update the state
   */
  setState: (newState: T | ((prevState: T) => T)) => void;

  /**
   * Reset state to initial value
   */
  resetState: () => void;

  /**
   * Clear state from storage
   */
  clearState: () => void;

  /**
   * Check if state exists in storage
   */
  hasPersistedState: boolean;
}

/**
 * Hook for persisting chat state
 */
export function useChatStatePersistence<T>({
  stateId,
  initialState,
  storage = typeof window !== 'undefined' ? window.localStorage : null,
  keyPrefix = 'chat_state_'
}: ChatStatePersistenceConfig<T>): ChatStatePersistenceResult<T> {
  // Create storage key
  const storageKey = `${keyPrefix}${stateId}`;

  // Check for existing state
  const getInitialState = useCallback(() => {
    if (!storage) return initialState;

    try {
      const storedValue = storage.getItem(storageKey);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      console.error('Error retrieving stored chat state:', error);
    }

    return initialState;
  }, [initialState, storage, storageKey]);

  // Create state
  const [state, setStateInternal] = useState<T>(getInitialState);
  const [hasPersistedState, setHasPersistedState] = useState<boolean>(false);

  // Check if state exists in storage
  useEffect(() => {
    if (!storage) return;

    const exists = storage.getItem(storageKey) !== null;
    setHasPersistedState(exists);
  }, [storage, storageKey]);

  // Set state with persistence
  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    setStateInternal(prev => {
      const nextState = typeof newState === 'function'
        ? (newState as ((prevState: T) => T))(prev)
        : newState;

      // Persist to storage
      if (storage) {
        try {
          storage.setItem(storageKey, JSON.stringify(nextState));
          setHasPersistedState(true);
        } catch (error) {
          console.error('Error storing chat state:', error);
        }
      }

      return nextState;
    });
  }, [storage, storageKey]);

  // Reset state to initial
  const resetState = useCallback(() => {
    setStateInternal(initialState);

    if (storage) {
      try {
        storage.setItem(storageKey, JSON.stringify(initialState));
      } catch (error) {
        console.error('Error resetting chat state:', error);
      }
    }
  }, [initialState, storage, storageKey]);

  // Clear state from storage
  const clearState = useCallback(() => {
    if (storage) {
      try {
        storage.removeItem(storageKey);
        setHasPersistedState(false);
      } catch (error) {
        console.error('Error clearing chat state:', error);
      }
    }

    setStateInternal(initialState);
  }, [initialState, storage, storageKey]);

  return {
    state,
    setState,
    resetState,
    clearState,
    hasPersistedState
  };
}
