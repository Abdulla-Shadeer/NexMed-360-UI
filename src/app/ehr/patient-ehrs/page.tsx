'use client';

import PatientEHRs from '@/components/ehr/patientEhrs';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useAuth } from '_context';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { ViewPatientDto } from '_types/dtos';
import { useState } from 'react';
import PatientIdForm from '@/components/forms/patientIdForm';

export default function FindEhrPage() {
  const [patient, setPatient] = useState<ViewPatientDto | undefined>(undefined);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const { accessToken } = useAuth();

  async function fetchPatientData(id: string) {
    const getPatient = createQueryFunction<ViewPatientDto>({
      path: API_PATHS.getPatient(id),
      method: 'GET',
      accessToken,
    });

    try {
      setNotification(undefined);
      const res = await getPatient();
      setPatient(res.data);
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Failed to fetch Patient data',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <PatientIdForm onFormSubmit={(id) => fetchPatientData(id)} />
      {patient && (
        <PatientEHRs
          patient={patient}
          onNotification={(notification) => setNotification(notification)}
        />
      )}
    </div>
  );
}
