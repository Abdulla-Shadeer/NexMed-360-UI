'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconEdit, IconLogout } from '@/components/icons/icons';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import ConfirmationDialog from '@/components/popup/confirmationDialog';
import { useUser, useWorkspace } from '_context';
import PatientAccessForm from '@/components/patient/patientAccessForm';
import { CheckBoxInput } from '@/components/input';
import KeyValueData from '@/components/misc/keyValueData';
import { WorkspaceModes } from '_constants/workspaceModes';
import { ConfirmationDialogContext } from '_types/common';
import Link from 'next/link';
import { useState } from 'react';

export default function Account() {
  const { user, logout } = useUser();
  const { workspaces, workspace } = useWorkspace();
  const [showPatientAccess, setShowPatientAccess] = useState(false);
  const [confirmationContext, setConfirmationContext] = useState<
    ConfirmationDialogContext | undefined
  >(undefined);
  return (
    <div className="w-full flex flex-col">
      {confirmationContext && (
        <ConfirmationDialog
          isOpen={confirmationContext !== undefined}
          message={confirmationContext.message}
          onConfirm={confirmationContext.onConfirm}
          onClose={confirmationContext.onClose}
        />
      )}
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <Link
          href={'/account/edit'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconEdit} />
          Edit
        </Link>

        <Link
          onNavigate={(e) => {
            e.preventDefault();
            setConfirmationContext({
              message:
                'Are you sure want to logout? you may have to re enter your credentials to login again!',
              onConfirm: () => {
                setConfirmationContext(undefined);
                logout();
              },
              onClose: () => setConfirmationContext(undefined),
            });
          }}
          href={'/login'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconLogout} />
          Logout
        </Link>
      </div>
      {unknownObjectRenderer(user!, 'Account Information')}
      {workspace?.mode === WorkspaceModes.Work && (
        <div className="my-6 p-6 space-y-3 bg-panel-light border-default border-border-primary rounded-default">
          <KeyValueData
            _key="Organization"
            value={workspace.organizationName ?? ''}
          />
          <KeyValueData
            _key="Access roles"
            value={
              workspace.accessRoleNames?.join(', ') ||
              'No access roles assigned'
            }
          />
          <KeyValueData
            _key="Practitioner role"
            value={
              workspace.practitionerAssignments.find(
                (row) => row.id === workspace.practitionerRoleId,
              )?.name ?? 'No clinical assignment selected'
            }
          />
        </div>
      )}
      {!workspaces.some((choice) => choice.mode === WorkspaceModes.Patient) && (
        <div className="mt-6 p-6 space-y-6 bg-panel-light border-default border-border-primary rounded-default">
          <CheckBoxInput
            name="Patient access"
            checkItems={['Enable patient access']}
            checkedItems={showPatientAccess ? ['Enable patient access'] : []}
            onChange={(items) => setShowPatientAccess(items.length > 0)}
            error=""
          />
          {showPatientAccess && <PatientAccessForm mode="enable" />}
        </div>
      )}
    </div>
  );
}
