import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { useFirestoreSubscription } from './useFirestoreSubscription';

function createWrapper() {
  return createWrapperWithClient(
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    })
  );
}

function createWrapperWithClient(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useFirestoreSubscription', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns loading state initially', () => {
    const subscribeFn = vi.fn(() => vi.fn());
    const { result } = renderHook(
      () => useFirestoreSubscription(['test'], subscribeFn),
      { wrapper: createWrapper() }
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('writes snapshots into TanStack Query cache', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    let callback: ((data: string[]) => void) | null = null;
    const unsubscribe = vi.fn();
    const subscribeFn = vi.fn((cb: (data: string[]) => void) => {
      callback = cb;
      return unsubscribe;
    });

    const { result } = renderHook(
      () => useFirestoreSubscription<string>(['test-data'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );

    expect(subscribeFn).toHaveBeenCalledTimes(1);

    act(() => {
      callback?.(['hello', 'world']);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(['hello', 'world']);
    });
    expect(result.current.isLoading).toBe(false);
    expect(queryClient.getQueryData(['test-data'])).toEqual(['hello', 'world']);
  });

  it('calls unsubscribe on unmount', () => {
    vi.useFakeTimers();
    const unsubscribe = vi.fn();
    const subscribeFn = vi.fn(() => unsubscribe);

    const { unmount } = renderHook(
      () => useFirestoreSubscription(['test-unmount'], subscribeFn),
      { wrapper: createWrapper() }
    );

    unmount();
    vi.runAllTimers();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('reuses cached data on remount with the same key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    let callback: ((data: string[]) => void) | null = null;
    const subscribeFn = vi.fn((cb: (data: string[]) => void) => {
      callback = cb;
      return vi.fn();
    });

    const first = renderHook(
      () => useFirestoreSubscription<string>(['cached'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );

    act(() => {
      callback?.(['cached-value']);
    });

    await waitFor(() => {
      expect(first.result.current.data).toEqual(['cached-value']);
    });

    first.unmount();

    const second = renderHook(
      () => useFirestoreSubscription<string>(['cached'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );

    expect(second.result.current.data).toEqual(['cached-value']);
    expect(second.result.current.isLoading).toBe(false);
  });

  it('unsubscribes the previous listener when the query key changes', () => {
    vi.useFakeTimers();
    const unsubscribes: ReturnType<typeof vi.fn>[] = [];
    const subscribeFn = vi.fn(() => {
      const unsubscribe = vi.fn();
      unsubscribes.push(unsubscribe);
      return unsubscribe;
    });

    const { rerender } = renderHook(
      ({ keyPart }) =>
        useFirestoreSubscription(['switch', keyPart], subscribeFn),
      {
        wrapper: createWrapper(),
        initialProps: { keyPart: 'one' },
      }
    );

    rerender({ keyPart: 'two' });

    expect(subscribeFn).toHaveBeenCalledTimes(2);
    vi.runAllTimers();
    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);
  });

  it('does not resubscribe when rerendered with the same serialized key', () => {
    const unsubscribe = vi.fn();
    const subscribeFn = vi.fn(() => unsubscribe);

    const { rerender } = renderHook(
      ({ projectId }) =>
        useFirestoreSubscription(['projects', projectId], subscribeFn),
      {
        wrapper: createWrapper(),
        initialProps: { projectId: 'p1' },
      }
    );

    rerender({ projectId: 'p1' });

    expect(subscribeFn).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('shares one listener across hooks with the same key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    let callback: ((data: string[]) => void) | null = null;
    const subscribeFn = vi.fn((cb: (data: string[]) => void) => {
      callback = cb;
      return vi.fn();
    });

    const first = renderHook(
      () => useFirestoreSubscription<string>(['shared'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );
    const second = renderHook(
      () => useFirestoreSubscription<string>(['shared'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );

    expect(subscribeFn).toHaveBeenCalledTimes(1);

    act(() => {
      callback?.(['shared-value']);
    });

    await waitFor(() => {
      expect(first.result.current.data).toEqual(['shared-value']);
      expect(second.result.current.data).toEqual(['shared-value']);
    });
  });

  it('fans out subscription errors to later subscribers sharing the same key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });
    let onError: ((error: Error) => void) | undefined;
    const subscribeFn = vi.fn(
      (_cb: (data: string[]) => void, nextOnError?: (error: Error) => void) => {
        onError = nextOnError;
        return vi.fn();
      }
    );

    const first = renderHook(
      () => useFirestoreSubscription<string>(['shared-error'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );
    const second = renderHook(
      () => useFirestoreSubscription<string>(['shared-error'], subscribeFn),
      { wrapper: createWrapperWithClient(queryClient) }
    );

    act(() => {
      onError?.(new Error('boom'));
    });

    await waitFor(() => {
      expect(first.result.current.error?.message).toBe('boom');
      expect(second.result.current.error?.message).toBe('boom');
    });
  });
});
