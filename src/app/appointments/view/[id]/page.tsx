'use client';
import ViewAppointmentCard from '@/components/appointments/viewAppointmentCard';
import QuickActionButton from '@/components/buttons/quickActionButton';
import { IconArrowLeft } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import { ViewAppointmentDto } from '@/types';
import { useAuth } from '_context';
import { useRouter } from 'next/navigation';
import { use } from 'react';
export default function ViewAppointment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewAppointmentDto>({
    path: API_PATHS.viewAppointmentById(id),
    method: 'GET',
    accessToken,
  });
  const router = useRouter();

  return (
    <div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <QuickActionButton
          text="Go back"
          icon={IconArrowLeft}
          onClick={router.back}
        />
      </div>
      {data && <ViewAppointmentCard appointment={data} />}
    </div>
  );
}
