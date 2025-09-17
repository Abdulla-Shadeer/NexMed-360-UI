'use client';

import ViewPrescriptions from '@/components/ehr/viewPrescriptions';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { AppNotification as AppNotificationType } from '_types/common';
import { ViewClinicRecordDto } from '_types/dtos';
import { use, useEffect, useState } from 'react';

export default function ViewPrescriptionsPage({
  params,
}: {
  params: Promise<{ ehrId: string }>;
}) {
  const { ehrId } = use(params);
  const { accessToken } = useAuth();
  const { data, isLoading, error } = useAppQuery<ViewClinicRecordDto>({
    path: apiPaths.getClinicRecord(ehrId),
    method: 'GET',
    accessToken,
  });
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  useEffect(() => {
    if (error) {
      setNotification(error);
    }
  }, [error]);

  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      {data && data.prescriptions && (
        <ViewPrescriptions prescriptions={data.prescriptions} />
      )}
    </div>
  );
}
