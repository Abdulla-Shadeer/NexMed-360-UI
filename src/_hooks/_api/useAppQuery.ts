import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import useQueryFunction, { ApiRequestOption } from './useQueryFunction';
import { AppNotificationType } from '_types/common';

export default function useAppQuery<T>(requestOptions: ApiRequestOption) {
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [error, setError] = useState<AppNotificationType | undefined>(
    undefined,
  );
  const [data, setData] = useState<T | undefined>(undefined);

  const queryResult = useQuery({
    queryKey: [requestOptions],
    queryFn: createQueryFunction<T>(requestOptions),
    refetchInterval: 5 * 1000 * 60,
    staleTime: 5 * 1000 * 60,
    refetchOnMount: true,
    retry: 2,
  });

  useEffect(() => {
    if (queryResult.isError) {
      console.info(
        `useAppQuery: something went wrong!,\nError: ${queryResult.error.message}`,
      );
      setError({
        type: 'error',
        title: 'Something went wrong!',
        description: queryResult.error.message,
        cause: queryResult.error.cause
          ? (queryResult.error.cause as string)
          : '',
      });
    } else {
      if (queryResult.data && queryResult.data.data) {
        console.info('useAppQuery: data received.');
        setData(queryResult.data.data);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryResult.data, queryResult.error]);

  return { isLoading, error, data };
}
