'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '_context';
import { API_PATHS } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import {
  OrganizationAdministratorDto,
  OrganizationAdministratorsDto,
} from '_types/access';
import { AppNotificationType } from '@/types';
import { permissionLabels } from '_utils/access';
import OrganizationSelector from '@/components/organization/organizationSelector';
import DeleteOrganizationButton from '@/components/organization/deleteOrganizationButton';
import { CheckBoxInput, Form } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import {
  IconCheckCircle,
  IconTrash,
  IconUserPlus,
} from '@/components/icons/icons';
import AppIcon from '@/components/icons/appIcon';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import ConfirmationDialog from '@/components/popup/confirmationDialog';

const administrationPermissions = [
  'organizations.manage',
  'members.manage',
  'roles.manage',
];

export default function OrganizationAdminsPage() {
  const search = useSearchParams();
  const [organizationId, setOrganizationId] = useState(search.get('id') ?? '');
  return (
    <div className="w-full space-y-6">
      <div className="border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default space-y-6">
        <h1 className="text-title pb-4 border-b-default border-border-primary">
          Manage Organization Administrators
        </h1>
        <p className="text-default">
          View administrators, update their organization access, or remove them
          from an organization. Shared login accounts are kept.
        </p>
        <OrganizationSelector
          selected={organizationId}
          onChange={setOrganizationId}
          fieldError=""
        />
      </div>
      {organizationId && (
        <Administrators key={organizationId} organizationId={organizationId} />
      )}
    </div>
  );
}

function Administrators({ organizationId }: { organizationId: string }) {
  const { accessToken } = useUser();
  const { data, error, isLoading } = useAppQuery<OrganizationAdministratorsDto>(
    {
      path: API_PATHS.organizationAdministrators(organizationId),
      method: 'GET',
      accessToken,
    },
  );
  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {data && (
        <>
          <div className="border-default border-border-primary rounded-default p-6 bg-background drop-shadow-default flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-title">{data.organizationName}</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/organization/assign-admin?id=${organizationId}`}
                className="inline-flex items-center gap-2 text-default text-blue-secondary border-default border-border-primary rounded-default px-4 py-2 bg-panel-light"
              >
                <AppIcon icon={IconUserPlus} />
                Assign Administrator
              </Link>
              <DeleteOrganizationButton
                organizationId={organizationId}
                organizationName={data.organizationName}
              />
            </div>
          </div>
          {!data.administrators.length && (
            <p className="text-default text-on-disabled">
              No organization administrators are assigned.
            </p>
          )}
          {data.administrators.map((admin) => (
            <AdministratorForm
              key={admin.id + JSON.stringify(admin)}
              organizationId={organizationId}
              admin={admin}
            />
          ))}
        </>
      )}
    </div>
  );
}

function AdministratorForm({
  organizationId,
  admin,
}: {
  organizationId: string;
  admin: OrganizationAdministratorDto;
}) {
  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const queryClient = useQueryClient();
  const [active, setActive] = useState(admin.isActive);
  const [permissions, setPermissions] = useState(admin.permissions);
  const [notification, setNotification] = useState<AppNotificationType>();
  const [confirming, setConfirming] = useState(false);

  async function save() {
    setNotification(undefined);
    if (
      !permissions.some((value) => administrationPermissions.includes(value))
    ) {
      setNotification({
        type: 'error',
        title: 'Choose an administration permission',
        description:
          'Keep at least one administration permission, or remove this administrator.',
      });
      return;
    }
    try {
      await createQueryFunction<string>({
        path: API_PATHS.organizationAdministrator(organizationId, admin.id),
        method: 'PUT',
        accessToken,
        payload: { isActive: active, permissions },
      })();
      setNotification({
        type: 'success',
        title: 'Administrator access updated',
      });
      await queryClient.invalidateQueries();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Could not update the administrator',
        description: (err.cause as string) || err.message,
      });
    }
  }

  async function remove() {
    setConfirming(false);
    setNotification(undefined);
    try {
      await createQueryFunction<string>({
        path: API_PATHS.organizationAdministrator(organizationId, admin.id),
        method: 'DELETE',
        accessToken,
      })();
      await queryClient.invalidateQueries();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Could not remove the administrator',
        description: (err.cause as string) || err.message,
      });
    }
  }

  return (
    <div className="w-full space-y-4">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      {confirming && (
        <ConfirmationDialog
          isOpen
          message={`Remove ${admin.name} from this organization? All their staff access to this organization will stop. Their shared login, patient profile, records, and access to other organizations will be kept.`}
          yesText="Remove administrator"
          noText="Cancel"
          onConfirm={() => void remove()}
          onClose={() => setConfirming(false)}
        />
      )}
      <Form title={admin.name} action={save}>
        <p className="w-full text-default text-black-secondary">
          {admin.email || 'No email address'}
        </p>
        <CheckBoxInput
          name="Organization access"
          error=""
          checkItems={[{ key: 'active', value: 'Active administrator' }]}
          checkedItems={active ? ['active'] : []}
          onChange={(values) => setActive(values.includes('active'))}
          disabled={isLoading}
        />
        <CheckBoxInput
          name="Administrator permissions"
          description="Choose organization administration permissions. Clinical access is optional and must be granted explicitly."
          error=""
          checkItems={Object.entries(permissionLabels).map(([key, value]) => ({
            key,
            value,
          }))}
          checkedItems={permissions}
          onChange={setPermissions}
          disabled={isLoading}
          tw_width="w-full"
        />
        <div className="w-full flex flex-wrap gap-4">
          <SecondaryButton
            type="submit"
            buttonText="Save Administrator"
            initialState="active"
            withIcon
            icon={IconCheckCircle}
            disabled={isLoading}
            onClick={() => {}}
          />
          <SecondaryButton
            buttonText="Remove Administrator"
            initialState="light"
            withIcon
            icon={IconTrash}
            disabled={isLoading}
            onClick={() => setConfirming(true)}
          />
        </div>
      </Form>
    </div>
  );
}
