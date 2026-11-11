'use client';
import useOwnPatient from '_hooks/_api/useOwnPatient';

import AppLoader from '@/components/misc/loader';
import PatientEHRs from '@/components/ehr/patientEhrs';
import { AppNotification } from '@/components/misc';

export default function OwnEhrsPage() {
  const { data: patient, error, isLoading } = useOwnPatient();
  return (
    <>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {patient && <PatientEHRs patient={patient} />}
    </>
  );
}
