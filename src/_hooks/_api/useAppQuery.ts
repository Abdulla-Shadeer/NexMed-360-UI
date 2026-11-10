import { useWorkspace } from '_context/_workspace/workspaceContext';
import { useQuery } from '@tanstack/react-query';
import useQueryFunction, { ApiRequestOption } from './useQueryFunction';
import { AppNotificationType } from '_types/common';

export default function useAppQuery<T>(
  requestOptions: ApiRequestOption,
  enabled = true,
) {
  const { workspace } = useWorkspace();
  const { createQueryFunction } = useQueryFunction();
  const result = useQuery({
    queryKey: [requestOptions, workspace?.key],
    queryFn: createQueryFunction<T>(requestOptions),
    enabled,
    refetchInterval: 5 * 1000 * 60,
    staleTime: 5 * 1000 * 60,
    refetchOnMount: true,
    retry: false,
  });
  const error: AppNotificationType | undefined = result.isError
    ? {
        type: 'error',
        title: 'Could not load the data',
        description: result.error.message,
      }
    : undefined;
  return { isLoading: result.isFetching, error, data: result.data?.data };
}
