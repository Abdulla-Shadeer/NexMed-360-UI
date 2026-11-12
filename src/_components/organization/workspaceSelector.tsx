'use client';
import { useState } from 'react';
import { WorkspaceModes } from '_constants/workspaceModes';
import { useUser, useWorkspace } from '_context';
import { ConfirmationDialogContext } from '@/types';
import { SelectInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { IconLogout } from '@/components/icons/icons';
import ConfirmationDialog from '@/components/popup/confirmationDialog';

export default function WorkspaceSelector() {
  const { logout } = useUser();
  const {
    workspace,
    workspaces,
    selectWorkspace,
    selectPractitionerAssignment,
  } = useWorkspace();
  const [confirmation, setConfirmation] = useState<ConfirmationDialogContext>();

  function confirmSwitch(key: string) {
    if (key === workspace?.key) return;
    if (!workspace) {
      void selectWorkspace(key);
      return;
    }
    setConfirmation({
      message:
        'Switch workspace? This will close the current patient or encounter and clear the page.',
      yesText: 'Switch workspace',
      noText: 'Cancel',
      onConfirm: () => {
        setConfirmation(undefined);
        void selectWorkspace(key);
      },
      onClose: () => setConfirmation(undefined),
    });
  }

  function confirmAssignment(id: string) {
    if (id === workspace?.practitionerRoleId) return;
    if (!workspace?.practitionerRoleId) {
      void selectPractitionerAssignment(id);
      return;
    }
    setConfirmation({
      message:
        'Change clinical assignment? This will close the current patient or encounter.',
      onConfirm: () => {
        setConfirmation(undefined);
        void selectPractitionerAssignment(id);
      },
      onClose: () => setConfirmation(undefined),
    });
  }

  function confirmLogout() {
    setConfirmation({
      message: 'Log out of NexMed360? You will need to log in again.',
      yesText: 'Log out',
      noText: 'Cancel',
      onConfirm: () => {
        setConfirmation(undefined);
        logout();
      },
      onClose: () => setConfirmation(undefined),
    });
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {confirmation && (
        <ConfirmationDialog
          isOpen
          message={confirmation.message}
          yesText={confirmation.yesText}
          noText={confirmation.noText}
          onConfirm={() => confirmation.onConfirm()}
          onClose={confirmation.onClose}
        />
      )}
      <SelectInput
        name="Workspace"
        options={workspaces.map((row) => ({ key: row.key, value: row.name }))}
        selected={workspace?.key ?? ''}
        onSelect={confirmSwitch}
        disabled={
          !workspaces.length || (workspaces.length === 1 && !!workspace)
        }
        description={
          workspaces.length > 1
            ? 'Choose an organization Work mode, Patient mode, or Platform Admin mode.'
            : undefined
        }
        error=""
        tw_width="w-full"
      />
      {workspace?.mode === WorkspaceModes.Work &&
        workspace.practitionerAssignments?.length > 1 && (
          <SelectInput
            name="Clinical assignment"
            description="Choose your assignment for clinical work. Your organization permissions stay the same."
            options={workspace.practitionerAssignments.map((row) => ({
              key: row.id,
              value: row.name,
            }))}
            selected={workspace.practitionerRoleId ?? ''}
            onSelect={confirmAssignment}
            error=""
            tw_width="w-full"
          />
        )}
      {!workspaces.length && (
        <p className="text-small text-on-disabled">
          No workspace is available. Ask your administrator for access.
        </p>
      )}
      <SecondaryButton
        buttonText="Log out"
        initialState="light"
        withIcon
        icon={IconLogout}
        onClick={confirmLogout}
        tw="w-full"
      />
    </div>
  );
}
