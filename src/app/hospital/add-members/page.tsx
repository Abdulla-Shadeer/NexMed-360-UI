'use client';
import { RadioInput } from '@/components/input';
import AddUserForm from '@/components/hospital/addUserForm';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification as AppNotificationType,
  CreateDoctorDto,
  CreateReceptionistDto,
  ViewUserDto,
} from '@/types';
import { useAuth } from '_context';
import { useState } from 'react';

export default function AddMembersPage() {
  const { accessToken, user } = useAuth();
  const [memberType, setMemberType] = useState<'doctor' | 'receptionist'>(
    'doctor',
  );
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function dispatchRequest(
    data: CreateDoctorDto | CreateReceptionistDto,
  ) {
    const request = createQueryFunction<ViewUserDto>({
      path:
        memberType === 'doctor' ? apiPaths.addDoctor : apiPaths.addReceptionist,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: `${memberType} Added Successfully!`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: `Failed to add ${memberType}!`,
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <h2 className="text-title px-1 py-2 bg-panel-light">
        Add Members to Your Hospital
      </h2>
      <RadioInput
        name="member type"
        selectItems={['doctor', 'receptionist']}
        selectedItem={memberType}
        onChange={(value) => setMemberType(value as 'doctor' | 'receptionist')}
        error=""
      />
      {memberType === 'doctor' && (
        <AddUserForm
          userType="doctor"
          onFormSubmit={(data) => dispatchRequest(data as CreateDoctorDto)}
          hospitalId={user?.hospitalAdminProfile?.hospitalId}
        />
      )}
      {memberType === 'receptionist' && (
        <AddUserForm
          userType="receptionist"
          onFormSubmit={(data) =>
            dispatchRequest(data as CreateReceptionistDto)
          }
          hospitalId={user?.hospitalAdminProfile?.hospitalId}
        />
      )}
    </div>
  );
}
