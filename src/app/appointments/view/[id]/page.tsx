'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconArrowLeft, IconEdit } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { AppointmentStatus, ViewAppointmentDto } from '_types/dtos';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';
export default function ViewAppointment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const returnPath = useSearchParams().get('returnPath');
  const currentPath = usePathname();
  const { accessToken, user } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewAppointmentDto>({
    path: apiPaths.viewAppointmentById(id),
    method: 'GET',
    accessToken,
  });

  return (
    <div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <Link
          href={returnPath ?? '/'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconArrowLeft} />
          Go back
        </Link>
        {data &&
          data.createdByUserId === user?.id &&
          !(
            data.status.toLowerCase() === AppointmentStatus.Cancelled ||
            data.status.toLowerCase() === AppointmentStatus.Completed
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
      {data && unknownObjectRenderer(data)}
    </div>
  );
}
