import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

type Unsubscribe = () => void;
interface SubscriptionEntry {
  refCount: number;
  unsubscribe: Unsubscribe;
  teardownTimer: ReturnType<typeof setTimeout> | undefined;
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

    const existingEntry = subscriptionRegistry.get(serializedQueryKey);
    if (existingEntry) {
      if (existingEntry.teardownTimer) {
        clearTimeout(existingEntry.teardownTimer);
        existingEntry.teardownTimer = undefined;
      }
      existingEntry.refCount += 1;
    } else {
      const unsubscribe = subscribeFn(
        (nextData) => {
          setSubscriptionError(null);
          queryClient.setQueryData(stableQueryKey, nextData);
        },
        (error) => {
          setSubscriptionError({ key: serializedQueryKey, error });
          console.error(
            `[firestore] subscription error (${serializedQueryKey}):`,
            error.message
          );
        }
      );

      subscriptionRegistry.set(serializedQueryKey, {
        refCount: 1,
        unsubscribe,
        teardownTimer: undefined,
      });
    }

    return () => {
      const entry = subscriptionRegistry.get(serializedQueryKey);
      if (!entry) {
        return;
      }

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
  }, [enabled, queryClient, serializedQueryKey, stableQueryKey, subscribeFn]);

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
