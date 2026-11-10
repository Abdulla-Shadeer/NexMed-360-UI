'use client';
import { useState } from 'react';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useUser, useWorkspace } from '_context';
import { AccessRoleDto, LocationDto, MembershipDto } from '_types/access';
import { AppNotificationType } from '@/types';
import { Form, CheckBoxInput, SelectInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { IconCheckCircle } from '@/components/icons/icons';

export default function ViewMembersPage() {
  const { accessToken } = useUser();
  const {
    data: members,
    error,
    isLoading,
  } = useAppQuery<MembershipDto[]>({
    path: '/Workspace/Members',
    method: 'GET',
    accessToken,
  });
  const {
    data: roles,
    error: rolesError,
    isLoading: loadingRoles,
  } = useAppQuery<AccessRoleDto[]>({
    path: '/Workspace/MemberRoles',
    method: 'GET',
    accessToken,
  });
  const {
    data: locations,
    error: locationError,
    isLoading: loadingLocations,
  } = useAppQuery<LocationDto[]>({
    path: '/Workspace/Locations',
    method: 'GET',
    accessToken,
  });
  return (
    <div className="w-full space-y-6">
      {(isLoading || loadingRoles || loadingLocations) && <AppLoader />}
      {(error || rolesError || locationError) && (
        <AppNotification
          notification={(error || rolesError || locationError)!}
        />
      )}
      <div className="border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default space-y-4">
        <h1 className="text-title pb-4 border-b-default border-border-primary">
          Manage Staff
        </h1>
        <p className="text-default">
          Manage staff sign-in access, role assignments, and locations.
          Deactivate staff to stop their access to this organization. Patient
          registration is managed separately.
        </p>
        {members?.length === 0 && (
          <p className="text-default text-on-disabled">
            No members were found.
          </p>
        )}
      </div>
      {roles &&
        locations &&
        members?.map((member) => (
          <MemberForm
            key={member.id}
            member={member}
            roles={roles}
            locations={locations}
          />
        ))}
    </div>
  );
}

function MemberForm({
  member,
  roles,
  locations,
}: {
  member: MembershipDto;
  roles: AccessRoleDto[];
  locations: LocationDto[];
}) {
  const { accessToken } = useUser();
  const { workspace, hasPermission, selectWorkspace } = useWorkspace();
  const [roleIds, setRoleIds] = useState(member.accessRoleIds);
  const [active, setActive] = useState(member.isActive);
  const [locationId, setLocationId] = useState(member.locationId ?? '');
  const [notification, setNotification] = useState<AppNotificationType>();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const canEdit = hasPermission('members.manage');
  // Keep an explicit option for all locations; an empty value is the select placeholder.
  const allLocations = 'all';

  async function save() {
    setNotification(undefined);
    try {
      await createQueryFunction<MembershipDto>({
        path: `/Workspace/Members/${member.id}`,
        method: 'PUT',
        accessToken,
        payload: {
          isActive: active,
          accessRoleIds: roleIds,
          locationId: locationId || null,
        },
      })();
      await selectWorkspace(workspace!.key);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Could not save the member',
        description: (err as Error).message,
      });
    }
  }

  return (
    <div className="w-full space-y-4">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <Form action={save} title={member.name}>
        <p className="w-full text-default text-black-secondary">
          {member.email || 'No email address'}
        </p>
        <CheckBoxInput
          name="Staff access"
          description="Turn off access to stop this staff member using the organization workspace. Their shared account is kept."
          error=""
          checkItems={[{ key: 'active', value: 'Allow organization access' }]}
          checkedItems={active ? ['active'] : []}
          disabled={!canEdit || isLoading}
          onChange={(items) => setActive(items.includes('active'))}
        />
        <SelectInput
          name="Location"
          description="Limit this member to a location, or allow all organization locations."
          error=""
          disabled={!canEdit || isLoading}
          selected={locationId || allLocations}
          onSelect={(value) =>
            setLocationId(value === allLocations ? '' : value)
          }
          options={[
            ...(!workspace?.isLocationRestricted
              ? [{ key: allLocations, value: 'All organization locations' }]
              : []),
            ...locations.map((row) => ({ key: row.id, value: row.name })),
          ]}
        />
        <CheckBoxInput
          name="Access roles"
          description="Assign the roles this staff member needs. You do not need to hold their clinical permissions."
          error=""
          checkItems={roles.map((role) => ({ key: role.id, value: role.name }))}
          checkedItems={roleIds}
          onChange={setRoleIds}
          disabled={!canEdit || isLoading}
          tw_width="w-full"
        />
        {!canEdit && (
          <p className="w-full text-small text-on-disabled">
            You need permission to manage staff.
          </p>
        )}
        <div className="w-full">
          <SecondaryButton
            buttonText="Save Staff Access"
            initialState="active"
            withIcon
            icon={IconCheckCircle}
            type="submit"
            disabled={!canEdit || isLoading}
            onClick={() => {}}
          />
        </div>
      </Form>
    </div>
  );
}
