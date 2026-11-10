'use client';

import AddUserForm from '@/components/organization/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { AppNotificationType, CreatePatientDto, ViewPatientDto } from '@/types';
import { useUser } from '_context';
import { useState } from 'react';

export default function AddPatientPage() {
  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function handleFormSubmit(data: CreatePatientDto) {
    const request = createQueryFunction<ViewPatientDto>({
      path: API_PATHS.addPatient,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: 'Added new Patient!',
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error Creating Patient!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <AddUserForm
        userType="patient"
        onFormSubmit={(data) => handleFormSubmit(data as CreatePatientDto)}
      />
    </div>
  );
}
