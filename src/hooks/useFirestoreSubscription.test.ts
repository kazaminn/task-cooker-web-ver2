import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFirestoreSubscription } from './useFirestoreSubscription';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useFirestoreSubscription', () => {
  it('returns loading state initially', () => {
    const subscribeFn = vi.fn(() => vi.fn());
    const { result } = renderHook(
      () => useFirestoreSubscription(['test'], subscribeFn),
      { wrapper: createWrapper() }
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('calls subscribeFn and returns data', async () => {
    let callback: ((data: string[]) => void) | null = null;
    const unsubscribe = vi.fn();
    const subscribeFn = vi.fn((cb: (data: string[]) => void) => {
      callback = cb;
      return unsubscribe;
    });

    const { result } = renderHook(
      () => useFirestoreSubscription<string>(['test-data'], subscribeFn),
      { wrapper: createWrapper() }
    );

    expect(subscribeFn).toHaveBeenCalledTimes(1);

    act(() => {
      callback?.(['hello', 'world']);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(['hello', 'world']);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribe = vi.fn();
    const subscribeFn = vi.fn(() => unsubscribe);

    const { unmount } = renderHook(
      () => useFirestoreSubscription(['test-unmount'], subscribeFn),
      { wrapper: createWrapper() }
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
