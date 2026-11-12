'use client';
import { CheckBoxInput } from '@/components/input';
import { permissionLabels } from '_utils/access';

import AddUserForm from '@/components/organization/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useUser } from '_context';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { CreateOrganizationManagerDto, ViewUserDto } from '_types/dtos';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AssignAdminPage() {
  const searchParams = useSearchParams();
  const [organizationId] = useState<string | undefined>(
    searchParams.get('id') ?? undefined,
  );
  const { accessToken } = useUser();
  const [permissions, setPermissions] = useState<string[]>([]);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function dispatchCreateRequest(dto: CreateOrganizationManagerDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: API_PATHS.assignOrganizationManager,
      method: 'POST',
      accessToken,
      payload: { ...dto, permissions },
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: 'Success!',
        description: 'Admin user assigned.',
      });
      return true;
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error assigning Admin!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
      return false;
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {notification && <AppNotification notification={notification} />}
      {isLoading && <AppLoader />}
      <div className="w-full border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default space-y-6">
        <h2 className="text-title pb-4 border-b-default border-border-primary">
          Administrator Permissions
        </h2>
        <CheckBoxInput
          name="Additional permissions"
          error=""
          tw_width="w-full"
          description="Extra permissions let this administrator perform clinical work. They are not needed to manage staff or access roles."
          checkItems={Object.entries(permissionLabels)
            .filter(
              ([value]) =>
                ![
                  'organizations.manage',
                  'members.manage',
                  'roles.manage',
                  'schedules.manage',
                ].includes(value),
            )
            .map(([key, value]) => ({ key, value }))}
          checkedItems={permissions}
          onChange={setPermissions}
          disabled={isLoading}
        />
      </div>
      <AddUserForm
        userType="organizationManager"
        onFormSubmit={(data) =>
          dispatchCreateRequest(data as CreateOrganizationManagerDto)
        }
        organizationId={organizationId}
      />
    </div>
  );
}
