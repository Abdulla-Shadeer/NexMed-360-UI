'use client';
import useOwnPatient from '_hooks/_api/useOwnPatient';

import AppLoader from '@/components/misc/loader';
import PatientEHRs from '@/components/ehr/patientEhrs';
import { AppNotificationType } from '@/types';
import { useState } from 'react';
import { AppNotification } from '@/components/misc';

export default function OwnEhrsPage() {
  const { data: patient, error, isLoading } = useOwnPatient();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  return (
    <>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {patient && (
        <PatientEHRs
          patient={patient}
          onNotification={(notification) => setNotification(notification)}
        />
      )}
    </>
  );
}
