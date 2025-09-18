'use client';

import QuickActionButton from '@/components/buttons/quickActionButton';
import ViewPrescriptions from '@/components/ehr/viewPrescriptions';
import { IconArrowLeft } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { ViewClinicRecordDto } from '_types/dtos';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function ViewPrescriptionsPage({
  params,
}: {
  params: Promise<{ ehrId: string }>;
}) {
  const { ehrId } = use(params);
  const { accessToken } = useAuth();
  const requestOption: ApiRequestOption = {
    path: apiPaths.getClinicRecord(ehrId),
    method: 'GET',
    accessToken,
  };
  const { data, isLoading, error } =
    useAppQuery<ViewClinicRecordDto>(requestOption);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      setNotification(error);
    }
  }, [error]);

  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <div className="w-full inline-flex items-center justify-between pb-3 border-b-default border-border-primary mb-6">
        <h2 className="text-title">Prescriptions</h2>
        <div className="inline-flex gap-6">
          <QuickActionButton
            text="Go back"
            icon={IconArrowLeft}
            onClick={router.back}
          />
          <RefreshData queryKey={requestOption} />
        </div>
      </div>
      {data && data.prescriptions && (
        <ViewPrescriptions prescriptions={data.prescriptions} />
      )}
    </div>
  );
}
