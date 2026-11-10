'use client';
import { useState } from 'react';
import { useUser, useWorkspace } from '_context';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { AccessRoleDto } from '_types/access';
import { AppNotificationType } from '@/types';
import { permissionLabels } from '_utils/access';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { Form, TextInput, CheckBoxInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import {
  IconEdit,
  IconPlusCircle,
  IconCheckCircle,
  IconShieldCheck,
} from '@/components/icons/icons';
import AppIcon from '@/components/icons/appIcon';

export default function AccessRolesPage() {
  const { accessToken } = useUser();
  const { workspace, selectWorkspace } = useWorkspace();
  const {
    data: roles,
    error,
    isLoading: loadingRoles,
  } = useAppQuery<AccessRoleDto[]>({
    path: '/Workspace/Roles',
    method: 'GET',
    accessToken,
  });
  const {
    data: catalogue,
    error: catalogueError,
    isLoading: loadingPermissions,
  } = useAppQuery<string[]>({
    path: '/Workspace/Permissions',
    method: 'GET',
    accessToken,
  });
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [editing, setEditing] = useState<AccessRoleDto>();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [notification, setNotification] = useState<AppNotificationType>();
  const [nameError, setNameError] = useState('');
  const restricted = !!workspace?.isLocationRestricted;

  function newRole() {
    setEditing(undefined);
    setName('');
    setPermissions([]);
    setNameError('');
    setNotification(undefined);
  }

  async function save() {
    const roleName = name.trim();
    if (!roleName || roleName.length > 100) {
      setNameError('Enter a role name with 1 to 100 characters.');
      return;
    }
    setNameError('');
    setNotification(undefined);
    try {
      await createQueryFunction<AccessRoleDto>({
        path: `/Workspace/Roles${editing ? `/${editing.id}` : ''}`,
        method: editing ? 'PUT' : 'POST',
        accessToken,
        payload: { name: roleName, permissions },
      })();
      await selectWorkspace(workspace!.key);
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Could not save the role',
        description: (err as Error).message,
      });
    }
  }

  return (
    <div className="w-full space-y-6">
      {(isLoading || loadingRoles || loadingPermissions) && <AppLoader />}
      {(error || catalogueError || notification) && (
        <AppNotification
          notification={(error || catalogueError || notification)!}
        />
      )}
      <div className="w-full border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default space-y-6">
        <div className="w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b-default border-border-primary">
          <h1 className="text-title inline-flex items-center gap-2">
            <AppIcon icon={IconShieldCheck} />
            Access Roles
          </h1>
          <SecondaryButton
            buttonText="New Role"
            initialState="light"
            withIcon
            icon={IconPlusCircle}
            disabled={restricted}
            onClick={newRole}
          />
        </div>
        <p className="text-default">
          Create permission groups for this organization. Managing permissions
          does not give you clinical access.
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {roles?.map((role) => {
            const allowed = !restricted;
            return (
              <div
                key={role.id}
                className="border-default border-border-primary rounded-default p-6 bg-panel-light flex flex-col gap-4"
              >
                <h2 className="text-title pb-3 border-b-default border-border-primary">
                  {role.name}
                </h2>
                <ul className="text-default space-y-2 flex-1">
                  {role.permissions.length ? (
                    role.permissions.map((value) => (
                      <li key={value} className="flex items-start gap-2">
                        <AppIcon
                          icon={IconCheckCircle}
                          tw="w-4 h-4 mt-1 shrink-0 text-green-primary"
                        />
                        {permissionLabels[value] ?? value}
                      </li>
                    ))
                  ) : (
                    <li className="text-on-disabled">
                      No permissions assigned.
                    </li>
                  )}
                </ul>
                <SecondaryButton
                  buttonText="Edit Role"
                  initialState="light"
                  withIcon
                  icon={IconEdit}
                  disabled={!allowed}
                  onClick={() => {
                    setEditing(role);
                    setName(role.name);
                    setPermissions(role.permissions);
                    setNameError('');
                    setNotification(undefined);
                  }}
                />
                {!allowed && (
                  <p className="text-small text-on-disabled">
                    {restricted
                      ? 'Choose an organization workspace to edit shared roles.'
                      : 'Choose an organization workspace to edit shared roles.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {roles?.length === 0 && (
          <p className="text-default text-on-disabled">
            No access roles have been created.
          </p>
        )}
      </div>
      {restricted && (
        <p className="text-small text-on-disabled">
          Role editing is disabled in a location workspace. Choose your
          organization workspace to manage shared roles.
        </p>
      )}
      <Form
        action={save}
        title={editing ? 'Edit Access Role' : 'Create Access Role'}
      >
        <TextInput
          name="Role name"
          value={name}
          onChange={setName}
          required
          error={nameError}
          disabled={restricted || isLoading}
        />
        <CheckBoxInput
          name="Permissions"
          description="Choose what staff assigned to this role can do in this organization."
          error=""
          checkItems={(catalogue ?? []).map((value) => ({
            key: value,
            value: permissionLabels[value] ?? value,
          }))}
          checkedItems={permissions}
          onChange={setPermissions}
          disabled={restricted || isLoading}
          tw_width="w-full"
        />
        <div className="w-full flex flex-wrap gap-4">
          <SecondaryButton
            buttonText="Save Role"
            initialState="active"
            withIcon
            icon={IconCheckCircle}
            type="submit"
            disabled={restricted || isLoading || !name.trim()}
            onClick={() => {}}
          />
          <SecondaryButton
            buttonText="New Role"
            initialState="light"
            withIcon
            icon={IconPlusCircle}
            disabled={restricted || isLoading}
            onClick={newRole}
          />
        </div>
      </Form>
    </div>
  );
}
