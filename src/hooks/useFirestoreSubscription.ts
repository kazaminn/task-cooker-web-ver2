import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

type Unsubscribe = () => void;
interface SubscriptionListener<T> {
  onData: (data: T[]) => void;
  onError: (error: Error) => void;
}
interface SubscriptionEntry {
  refCount: number;
  unsubscribe: Unsubscribe;
  teardownTimer: ReturnType<typeof setTimeout> | undefined;
  listeners: Map<symbol, SubscriptionListener<unknown>>;
}

const subscriptionRegistry = new Map<string, SubscriptionEntry>();

export function useFirestoreSubscription<T>(
  queryKey: QueryKey,
  subscribeFn: (
    callback: (data: T[]) => void,
    onError?: (error: Error) => void
  ) => Unsubscribe,
  options?: { enabled?: boolean }
): { data: T[] | undefined; isLoading: boolean; error: Error | null } {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;
  const serializedQueryKey = useMemo(
    () => JSON.stringify(queryKey),
    [queryKey]
  );
  const listenerId = useMemo(
    () => Symbol(serializedQueryKey),
    [serializedQueryKey]
  );
  const stableQueryKey = useMemo(
    () => JSON.parse(serializedQueryKey) as QueryKey,
    [serializedQueryKey]
  );
  const [subscriptionError, setSubscriptionError] = useState<{
    key: string;
    error: Error;
  } | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const notifyData = (nextData: T[]) => {
      setSubscriptionError(null);
      queryClient.setQueryData(stableQueryKey, nextData);
    };
    const notifyError = (error: Error) => {
      setSubscriptionError({ key: serializedQueryKey, error });
    };

    let entry = subscriptionRegistry.get(serializedQueryKey);
    if (!entry) {
      entry = {
        refCount: 0,
        unsubscribe: () => undefined,
        teardownTimer: undefined,
        listeners: new Map(),
      };
      subscriptionRegistry.set(serializedQueryKey, entry);
      const currentEntry = entry;
      currentEntry.unsubscribe = subscribeFn(
        (nextData) => {
          queryClient.setQueryData(stableQueryKey, nextData);
          for (const listener of currentEntry.listeners.values()) {
            listener.onData(nextData);
          }
        },
        (error) => {
          console.error(
            `[firestore] subscription error (${serializedQueryKey}):`,
            error.message
          );
          for (const listener of currentEntry.listeners.values()) {
            listener.onError(error);
          }
        }
      );
    } else if (entry.teardownTimer) {
      clearTimeout(entry.teardownTimer);
      entry.teardownTimer = undefined;
    }
    entry.refCount += 1;
    entry.listeners.set(listenerId, {
      onData: notifyData as SubscriptionListener<unknown>['onData'],
      onError: notifyError,
    });

    return () => {
      const entry = subscriptionRegistry.get(serializedQueryKey);
      if (!entry) {
        return;
      }

      entry.listeners.delete(listenerId);
      entry.refCount -= 1;
      if (entry.refCount <= 0) {
        entry.teardownTimer = setTimeout(() => {
          const currentEntry = subscriptionRegistry.get(serializedQueryKey);
          if (!currentEntry || currentEntry.refCount > 0) {
            return;
          }

          currentEntry.unsubscribe();
          subscriptionRegistry.delete(serializedQueryKey);
        }, 250);
      }
    };
  }, [
    enabled,
    listenerId,
    queryClient,
    serializedQueryKey,
    stableQueryKey,
    subscribeFn,
  ]);

  const { data, error } = useQuery<T[] | undefined, Error>({
    queryKey: stableQueryKey,
    queryFn: () =>
      new Promise<T[] | undefined>(() => {
        /* data is supplied via onSnapshot */
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data,
    isLoading:
      enabled &&
      data === undefined &&
      subscriptionError?.key !== serializedQueryKey,
    error:
      subscriptionError?.key === serializedQueryKey
        ? subscriptionError.error
        : error,
  };
}
