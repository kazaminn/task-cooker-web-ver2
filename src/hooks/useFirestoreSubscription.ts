import { useEffect } from 'react';
import { useQueryClient, useQuery, type QueryKey } from '@tanstack/react-query';

type Unsubscribe = () => void;

export function useFirestoreSubscription<T>(
  queryKey: QueryKey,
  subscribeFn: (
    callback: (data: T[]) => void,
    onError?: (error: Error) => void
  ) => Unsubscribe
): { data: T[] | undefined; isLoading: boolean; error: Error | null } {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeFn(
      (data) => {
        queryClient.setQueryData(queryKey, data);
      },
      (error) => {
        console.error(
          `[firestore] subscription error (${JSON.stringify(queryKey)}):`,
          error.message
        );
      }
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryKey)]);

  const { data, isLoading, error } = useQuery<T[]>({
    queryKey,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    queryFn: () => new Promise<T[]>(() => {}), // never resolves; data comes from subscription
    staleTime: Infinity,
  });

  return { data, isLoading: isLoading && !data, error: error };
}
