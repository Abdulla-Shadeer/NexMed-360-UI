'use client';
import { useState } from 'react';
import { useUser, useWorkspace } from '_context';
import { ConfirmationDialogContext } from '@/types';
import { SelectInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { IconLogout } from '@/components/icons/icons';
import ConfirmationDialog from '@/components/popup/confirmationDialog';

export default function WorkspaceSelector() {
  const { logout } = useUser();
  const { workspace, workspaces, selectWorkspace } = useWorkspace();
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
            ? 'Choose your patient account, organization, or practitioner assignment.'
            : undefined
        }
        error=""
        tw_width="w-full"
      />
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
