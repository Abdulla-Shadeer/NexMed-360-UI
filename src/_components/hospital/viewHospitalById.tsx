'use client';
import { apiPaths, userRoles } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ViewHospitalDto } from '_types/dtos';
import Link from 'next/link';
import AppIcon from '../icons/appIcon';
import { IconArrowLeft, IconEdit } from '../icons/icons';
import { AppNotification } from '../misc';
import AppLoader from '../misc/loader';
import { unknownObjectRenderer } from '../misc/unknownObjectRenderer';
import { useRouter } from 'next/navigation';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import QuickActionButton from '../buttons/quickActionButton';
import RefreshData from '../misc/refresh';

export function ViewHospitalById({ id }: { id: string }) {
  const { accessToken, user } = useAuth();
  const queryKey: ApiRequestOption = {
    path: apiPaths.getHospitalById(id),
    method: 'GET',
    accessToken,
  };
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto>(queryKey);
  const router = useRouter();

  return (
    <div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <QuickActionButton
          text="Go Back"
          icon={IconArrowLeft}
          onClick={router.back}
        />
        <RefreshData queryKey={queryKey} />
        {data &&
          user?.roles.some(
            (role) =>
              role === userRoles.superUser || role === userRoles.hospitalAdmin,
          ) && (
            <Link
              href={`/hospital/edit/${id}`}
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
