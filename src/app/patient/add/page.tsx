'use client';

import AddUserForm from '@/components/hospital/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification as AppNotificationType,
  CreatePatientDto,
  ViewUserDto,
} from '@/types';
import { useAuth } from '_context';
import { useState } from 'react';

export default function AddPatientPage() {
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function handleFormSubmit(data: CreatePatientDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: apiPaths.addPatient,
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
