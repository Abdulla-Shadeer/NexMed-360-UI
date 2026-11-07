'use client';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import { ViewUserDto } from '_types/dtos';
import { randomUUID } from 'crypto';

export default function ViewMembersPage() {
  const { accessToken, user } = useAuth();
  const queryKey: ApiRequestOption = {
    path: API_PATHS.getOrganizationMembers(
      user?.organizationManagerProfile?.organizationId ?? randomUUID(),
    ),
    method: 'GET',
    accessToken,
  };
  const { data, error, isLoading } = useAppQuery<ViewUserDto[]>(queryKey);

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {<RefreshData queryKey={queryKey} />}
      <div className="w-full flex flex-row gap-6 flex-wrap">
        {data?.map((dto) => {
          const memberType = dto.practitionerRoleProfile
            ? 'PractitionerRole'
            : 'OrganizationMember';
          return (
            <div key={dto.id + memberType} className="w-[373px] bg-background">
              {unknownObjectRenderer(dto, memberType)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
