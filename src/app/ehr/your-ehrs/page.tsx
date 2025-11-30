'use client';

import PatientEHRs from '@/components/ehr/patientEhrs';
import { useAuth } from '_context';
import { AppNotificationType } from '@/types';
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
      {user?.patientProfile && (
        <PatientEHRs
          patient={user?.patientProfile}
          onNotification={(notification) => setNotification(notification)}
        />
      )}
    </>
  );
}
