'use client';

import PatientEHRs from '@/components/ehr/patientEhrs';
import { useAuth } from '_context';
import { AppNotification as AppNotificationType } from '@/types';
import { useState } from 'react';
import { AppNotification } from '@/components/misc';

export default function OwnEhrsPage() {
  const { user } = useAuth();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  return (
    <>
      {notification && <AppNotification notification={notification} />}
      <PatientEHRs
        patientId={user?.patientProfile?.id ?? ''}
        onNotification={(notification) => setNotification(notification)}
      />
    </>
  );
}
