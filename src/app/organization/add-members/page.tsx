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
import { useUser, useWorkspace } from '_context';
import { useState } from 'react';

export default function AddMembersPage() {
  const { accessToken } = useUser();
  const { workspace, hasPermission } = useWorkspace();
  const [memberType, setMemberType] = useState<
    'practitionerRole' | 'organizationMember'
  >('practitionerRole');
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  const canAdd =
    !workspace?.isLocationRestricted && hasPermission('members.manage');

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
        title:
          memberType === 'practitionerRole'
            ? 'Practitioner assignment added'
            : 'Staff member added',
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Could not add staff',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <h2 className="text-title px-1 py-2 bg-panel-light">Add Staff</h2>
      <RadioInput
        name="Staff type"
        selectItems={['Practitioner assignment', 'Organization staff']}
        selectedItem={
          memberType === 'practitionerRole'
            ? 'Practitioner assignment'
            : 'Organization staff'
        }
        onChange={(value) =>
          setMemberType(
            value === 'Practitioner assignment'
              ? 'practitionerRole'
              : 'organizationMember',
          )
        }
        error=""
      />
      {!canAdd && (
        <p>
          Choose your organization workspace to add staff. You need staff
          management permission, not clinical permissions.
        </p>
      )}
      <fieldset disabled={!canAdd} className={!canAdd ? 'opacity-50' : ''}>
        {memberType === 'practitionerRole' && (
          <AddUserForm
            userType="practitionerRole"
            onFormSubmit={(data) =>
              dispatchRequest(data as CreatePractitionerRoleDto)
            }
            organizationId={workspace?.organizationId}
          />
        )}
        {memberType === 'organizationMember' && (
          <AddUserForm
            userType="organizationMember"
            onFormSubmit={(data) =>
              dispatchRequest(data as CreateOrganizationMemberDto)
            }
            organizationId={workspace?.organizationId}
          />
        )}
      </fieldset>
    </div>
  );
}
