'use client';
import { RadioInput } from '@/components/input';
import AddUserForm from '@/components/organization/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotificationType,
  CreatePractitionerRoleDto,
  CreateOrganizationMemberDto,
  ViewUserDto,
} from '@/types';
import { useAuth } from '_context';
import { useState } from 'react';

export default function AddMembersPage() {
  const { accessToken, user } = useAuth();
  const [memberType, setMemberType] = useState<
    'practitionerRole' | 'organizationMember'
  >('practitionerRole');
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function dispatchRequest(
    data: CreatePractitionerRoleDto | CreateOrganizationMemberDto,
  ) {
    const request = createQueryFunction<ViewUserDto>({
      path:
        memberType === 'practitionerRole'
          ? API_PATHS.addPractitionerRole
          : API_PATHS.addOrganizationMember,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: `${memberType} Added Successfully!`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: `Failed to add ${memberType}!`,
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <h2 className="text-title px-1 py-2 bg-panel-light">
        Add Members to Your Organization
      </h2>
      <RadioInput
        name="member type"
        selectItems={['practitionerRole', 'organizationMember']}
        selectedItem={memberType}
        onChange={(value) =>
          setMemberType(value as 'practitionerRole' | 'organizationMember')
        }
        error=""
      />
      {memberType === 'practitionerRole' && (
        <AddUserForm
          userType="practitionerRole"
          onFormSubmit={(data) =>
            dispatchRequest(data as CreatePractitionerRoleDto)
          }
          organizationId={user?.organizationManagerProfile?.organizationId}
        />
      )}
      {memberType === 'organizationMember' && (
        <AddUserForm
          userType="organizationMember"
          onFormSubmit={(data) =>
            dispatchRequest(data as CreateOrganizationMemberDto)
          }
          organizationId={user?.organizationManagerProfile?.organizationId}
        />
      )}
    </div>
  );
}
