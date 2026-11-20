'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useUser } from '_context';
import { AppNotificationType, ViewPractitionerRoleDto } from '@/types';
import { CheckBoxInput } from '@/components/input';
import { AppNotification } from '@/components/misc';

export default function PractitionerBookingSettings({
  userId,
}: {
  userId: string;
}) {
  const { accessToken } = useUser();
  const { data, error } = useAppQuery<ViewPractitionerRoleDto[]>({
    path: '/PractitionerAssignments',
    method: 'GET',
    accessToken,
    queryParams: { userId },
  });
  const { createQueryFunction, isLoading } = useQueryFunction();
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<AppNotificationType>();
  async function save(id: string, acceptsAppointments: boolean) {
    try {
      await createQueryFunction<boolean>({
        path: `/PractitionerAssignments/${id}/Booking`,
        method: 'PUT',
        accessToken,
        payload: { acceptsAppointments },
      })();
      setNotification({ type: 'success', title: 'Appointment setting saved' });
      await queryClient.invalidateQueries();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not save appointment setting',
        description: (error as Error).message,
      });
    }
  }
  return (
    <div className="mt-6 space-y-4">
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {data?.map((role) => (
        <CheckBoxInput
          key={role.id}
          name={`${role.firstName} ${role.lastName} — ${role.roleName}`}
          description={role.specialty || undefined}
          checkItems={['Accept appointments']}
          checkedItems={role.acceptsAppointments ? ['Accept appointments'] : []}
          disabled={isLoading}
          onChange={(items) => void save(role.id, items.length > 0)}
          error=""
        />
      ))}
    </div>
  );
}
