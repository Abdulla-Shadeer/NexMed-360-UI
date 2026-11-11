'use client';
import { CheckBoxInput, RadioInput, SelectInput } from '@/components/input';
import AddUserForm from '@/components/organization/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { AccessRoleDto, LocationDto } from '_types/access';
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
  >('organizationMember');
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  const canAdd = hasPermission('members.manage');
  const [locationId, setLocationId] = useState('');
  const {
    data: locations,
    error: locationError,
    isLoading: locationsLoading,
  } = useAppQuery<LocationDto[]>(
    { path: '/Workspace/Locations', method: 'GET', accessToken },
    canAdd,
  );
  const [accessRoleIds, setAccessRoleIds] = useState<string[]>([]);
  const {
    data: accessRoles,
    error: rolesError,
    isLoading: rolesLoading,
  } = useAppQuery<AccessRoleDto[]>(
    { path: '/Workspace/MemberRoles', method: 'GET', accessToken },
    canAdd,
  );
  const allLocations = 'all';

  async function dispatchRequest(
    data: CreatePractitionerRoleDto | CreateOrganizationMemberDto,
  ) {
    if (workspace?.isLocationRestricted && !locationId) {
      setNotification({
        type: 'error',
        title: 'Choose a location',
        description:
          'Choose a location within your workspace before adding staff.',
      });
      return;
    }

    const request = createQueryFunction<ViewUserDto>({
      path:
        memberType === 'practitionerRole'
          ? API_PATHS.addPractitionerRole
          : API_PATHS.addOrganizationMember,
      method: 'POST',
      accessToken,
      payload: { ...data, locationId: locationId || null, accessRoleIds },
    });

    try {
      setNotification(undefined);
      await request();
      setAccessRoleIds([]);
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
      {(isLoading || locationsLoading || rolesLoading) && <AppLoader />}
      {locationError && <AppNotification notification={locationError} />}
      {rolesError && <AppNotification notification={rolesError} />}
      {notification && <AppNotification notification={notification} />}
      <h2 className="text-title px-1 py-2 bg-panel-light">Add Staff</h2>
      <p className="text-default">
        Add a member for any employee, or a practitioner assignment for care
        work. Access roles control permissions.
      </p>
      <RadioInput
        name="Staff type"
        selectItems={['Member', 'Practitioner assignment']}
        selectedItem={
          memberType === 'practitionerRole'
            ? 'Practitioner assignment'
            : 'Member'
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
          You need staff management permission to add staff in this workspace.
        </p>
      )}
      <SelectInput
        name="Location"
        description={
          workspace?.isLocationRestricted
            ? 'Choose a location within your workspace. Existing staff keep their current location scope.'
            : 'Choose a location or allow all organization locations. Existing staff keep their current location scope.'
        }
        required={!!workspace?.isLocationRestricted}
        selected={
          locationId || (workspace?.isLocationRestricted ? '' : allLocations)
        }
        onSelect={(value) => setLocationId(value === allLocations ? '' : value)}
        options={[
          ...(!workspace?.isLocationRestricted
            ? [{ key: allLocations, value: 'All organization locations' }]
            : []),
          ...(locations ?? []).map((location) => ({
            key: location.id,
            value: location.name,
          })),
        ]}
        disabled={!canAdd || isLoading || locationsLoading || !!locationError}
        error=""
        tw_width="w-full"
      />
      {accessRoles?.length ? (
        <CheckBoxInput
          name="Access roles (optional)"
          description="Select only the access this person needs. Leave empty to add no new permissions. Existing staff keep their roles."
          checkItems={accessRoles.map((role) => ({
            key: role.id,
            value: role.name,
          }))}
          checkedItems={accessRoleIds}
          onChange={setAccessRoleIds}
          disabled={!canAdd || isLoading || rolesLoading || !!rolesError}
          error=""
          tw_width="w-full"
        />
      ) : !rolesLoading && !rolesError ? (
        <p className="text-default">
          No access roles are available. You can add the member without
          permissions.
        </p>
      ) : null}
      <fieldset
        disabled={
          !canAdd ||
          isLoading ||
          locationsLoading ||
          rolesLoading ||
          !!locationError ||
          !!rolesError
        }
        className={!canAdd ? 'opacity-50' : ''}
      >
        {memberType === 'practitionerRole' && (
          <AddUserForm
            userType="practitionerRole"
            onFormSubmit={(data) =>
              dispatchRequest(data as CreatePractitionerRoleDto)
            }
            organizationId={workspace?.organizationId}
            onClear={() => setAccessRoleIds([])}
          />
        )}
        {memberType === 'organizationMember' && (
          <AddUserForm
            userType="organizationMember"
            onFormSubmit={(data) =>
              dispatchRequest(data as CreateOrganizationMemberDto)
            }
            organizationId={workspace?.organizationId}
            onClear={() => setAccessRoleIds([])}
          />
        )}
      </fieldset>
    </div>
  );
}
