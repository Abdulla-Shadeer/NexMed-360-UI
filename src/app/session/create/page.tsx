'use client';

import { useQueryFunction } from '@/hooks';
import { useAuth } from '_context';
import {
  AppNotificationType,
  CreatePractitionerScheduleDto,
  ViewPractitionerScheduleDto,
} from '@/types';
import { useMemo, useState } from 'react';
import AppLoader from '@/components/misc/loader';
import { AppNotification } from '@/components/misc';
import { API_PATHS } from '@/constants';
import CreatePractitionerScheduleForm from '@/components/practitionerSchedule/createPractitionerSchedule';

export default function CreateSessionPage() {
  const { accessToken, user } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const defaultData = useMemo<CreatePractitionerScheduleDto>(() => {
    return {
      practitionerRoleId: user?.practitionerRoleProfile?.id ?? '',
      organizationId:
        user?.practitionerRoleProfile?.organizationId ??
        user?.organizationManagerProfile?.organizationId ??
        '',
      startTime: '',
      endTime: '',
      slotDurationMinutes: 30,
      occurrences: [],
    };
  }, [user]);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function createSession(data: CreatePractitionerScheduleDto) {
    data.startTime = data.startTime.concat(':00');
    data.endTime = data.endTime.concat(':00');
    const create = createQueryFunction<ViewPractitionerScheduleDto>({
      path: API_PATHS.createPractitionerSchedule,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const res = await create();
      setNotification({
        type: 'success',
        title: 'Session Created Successfully!',
        description: `Reference: ${res.data?.id}`,
        cause: `Occurs on : ${res.data?.occurrences.join(', ')}`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error creating Session!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <CreatePractitionerScheduleForm
        defaultData={defaultData}
        onFormSubmit={(data) => createSession(data)}
        onNotification={(notification) => setNotification(notification)}
      />
    </div>
  );
}
