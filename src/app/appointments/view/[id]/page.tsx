'use client';
import ViewAppointmentCard from '@/components/appointments/viewAppointmentCard';
import QuickActionButton from '@/components/buttons/quickActionButton';
import AppIcon from '@/components/icons/appIcon';
import { IconArrowLeft, IconEdit } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { AppointmentStatusDto, ViewAppointmentDto } from '_types/dtos';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { use } from 'react';
export default function ViewAppointment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const currentPath = usePathname();
  const { accessToken, user } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewAppointmentDto>({
    path: apiPaths.viewAppointmentById(id),
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
        {data &&
          data.createdByUserId === user?.id &&
          !(
            data.status === AppointmentStatusDto.Cancelled ||
            data.status === AppointmentStatusDto.Completed
          ) && (
            <Link
              href={`/appointments/edit/${id}?returnPath=${currentPath}`}
              className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
            >
              <AppIcon icon={IconEdit} />
              Edit
            </Link>
          )}
      </div>
      {data && <ViewAppointmentCard appointment={data} />}
    </div>
  );
}
