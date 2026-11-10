'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '_context';
import { useQueryFunction } from '@/hooks';
import { API_PATHS } from '@/constants';
import { AppNotificationType } from '@/types';
import { SecondaryButton } from '@/components/buttons';
import { IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import ConfirmationDialog from '@/components/popup/confirmationDialog';

export default function DeleteOrganizationButton({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [notification, setNotification] = useState<AppNotificationType>();

  async function remove() {
    setConfirming(false);
    setNotification(undefined);
    try {
      await createQueryFunction<string>({
        path: API_PATHS.deleteOrganization(organizationId),
        method: 'DELETE',
        accessToken,
      })();
      await queryClient.invalidateQueries();
      router.push('/organization/view-all');
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Could not delete the organization',
        description: (err.cause as string) || err.message,
      });
    }
  }

  return (
    <>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      {confirming && (
        <ConfirmationDialog
          isOpen
          message={`Delete ${organizationName}? This removes its unused staff and scheduling setup. Organizations with patient registrations or care history cannot be deleted.`}
          yesText="Delete organization"
          noText="Cancel"
          onConfirm={() => void remove()}
          onClose={() => setConfirming(false)}
        />
      )}
      <SecondaryButton
        buttonText="Delete Organization"
        initialState="light"
        withIcon
        icon={IconTrash}
        disabled={isLoading}
        onClick={() => setConfirming(true)}
      />
    </>
  );
}
