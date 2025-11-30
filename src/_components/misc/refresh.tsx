'use client';
import { useQueryClient } from '@tanstack/react-query';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import QuickActionButton from '../buttons/quickActionButton';
import { IconRefresh } from '../icons/icons';

export default function RefreshData({
  queryKey,
}: {
  queryKey: ApiRequestOption;
}) {
  const queryClient = useQueryClient();
  function invalidate() {
    queryClient.invalidateQueries({
      exact: true,
      queryKey: [queryKey],
    });
  }

  return (
    <QuickActionButton text="Refresh" onClick={invalidate} icon={IconRefresh} />
  );
}
