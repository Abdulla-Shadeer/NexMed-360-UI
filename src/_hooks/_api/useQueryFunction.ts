import { useState } from 'react';
import { useWorkspace } from '_context/_workspace/workspaceContext';
import { requestApi, ApiRequestOption } from '_utils/requestApi';
export type { ApiRequestOption } from '_utils/requestApi';

export default function useQueryFunction() {
  const { workspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  function createQueryFunction<T>(options: ApiRequestOption) {
    const key = workspace?.key;
    return async (context?: { signal?: AbortSignal }) => {
      setIsLoading(true);
      try {
        return await requestApi<T>(options, key, context?.signal);
      } finally {
        setIsLoading(false);
      }
    };
  }
  return { createQueryFunction, isLoading };
}
