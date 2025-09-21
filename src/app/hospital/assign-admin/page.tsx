'use client';

import AddUserForm from '@/components/hospital/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useAuth } from '_context';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { CreateHospitalAdminDto, ViewUserDto } from '_types/dtos';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AssignAdminPage() {
  const searchParams = useSearchParams();
  const [hospitalId] = useState<string | undefined>(
    searchParams.get('id') ?? undefined,
  );
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function dispatchCreateRequest(dto: CreateHospitalAdminDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: API_PATHS.assignHospitalAdmin,
      method: 'POST',
      accessToken,
      payload: dto,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: 'Success!',
        description: 'Admin user assigned.',
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error assigning Admin!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {notification && <AppNotification notification={notification} />}
      {isLoading && <AppLoader />}
      <AddUserForm
        userType="hospitalAdmin"
        onFormSubmit={(data) =>
          dispatchCreateRequest(data as CreateHospitalAdminDto)
        }
        hospitalId={hospitalId}
      />
    </div>
  );
}
