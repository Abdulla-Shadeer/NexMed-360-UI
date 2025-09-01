'use client';

import AppIcon from '@/components/icons/appIcon';
import { IconArrowLeft, IconEdit } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { apiPaths, userRoles } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ViewHospitalDto } from '_types/dtos';
import Link from 'next/link';
import { use } from 'react';

export default function ViewHospitalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken, user } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto>({
    path: apiPaths.getHospitalById(id),
    method: 'GET',
    accessToken,
  });
  return (
    <div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <Link
          href={'/hospital/view-all'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconArrowLeft} />
          Go back
        </Link>
        {data &&
          user?.roles.some(
            (role) =>
              role === userRoles.superUser || role === userRoles.hospitalAdmin,
          ) && (
            <Link
              href={`/hospital/edit/${id}?returnPath=/hospital/view/${id}`}
              className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
            >
              <AppIcon icon={IconEdit} />
              Edit
            </Link>
          )}
      </div>
      {data && unknownObjectRenderer(data, 'Hospital Details')}
    </div>
  );
}
