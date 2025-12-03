'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconEdit, IconLogout } from '@/components/icons/icons';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import ConfirmationDialog from '@/components/popup/confirmationDialog';
import { useAuth } from '_context';
import { ConfirmationDialogContext } from '_types/common';
import Link from 'next/link';
import { useState } from 'react';

export default function Account() {
  const { user, logout } = useAuth();
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
    </div>
  );
}
