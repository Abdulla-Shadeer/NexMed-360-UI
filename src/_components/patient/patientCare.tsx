'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppQuery } from '@/hooks';
import { API_PATHS } from '@/constants';
import { useUser, useWorkspace } from '_context';
import { AppNotificationType, ViewPatientDto } from '@/types';
import { AppNotification } from '@/components/misc';
import KeyValueData from '@/components/misc/keyValueData';
import AppLoader from '@/components/misc/loader';
import { SecondaryButton } from '@/components/buttons';
import PatientEHRs from '@/components/ehr/patientEhrs';
import CreateEHR from '@/components/ehr/createEHR';
import PatientSelector from './patientSelector';

export default function PatientCare({
  initialTab = 'history',
}: {
  initialTab?: 'history' | 'record';
}) {
  const searchParams = useSearchParams();
  const [patientId, setPatientId] = useState(searchParams.get('id') ?? '');
  const [tab, setTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<AppNotificationType>();
  const { accessToken } = useUser();
  const { workspace, hasPermission } = useWorkspace();
  const canFind = hasPermission('patients.read');
  const canRead = hasPermission('clinical-records.read');
  const canWrite =
    hasPermission('clinical-records.write') && !!workspace?.practitionerRoleId;
  const {
    data: patient,
    isLoading,
    error,
  } = useAppQuery<ViewPatientDto>(
    { path: API_PATHS.getPatient(patientId), method: 'GET', accessToken },
    canFind && !!patientId,
  );

  return (
    <div className="w-full space-y-6">
      <h2 className="text-title px-1 py-2 bg-panel-light">Patient Care</h2>
      <p>
        View patient history and add a clinical record. An appointment or
        schedule is optional.
      </p>
      {notification && <AppNotification notification={notification} />}
      {error && <AppNotification notification={error} />}
      {isLoading && <AppLoader />}
      {!canFind ? (
        <p>You need permission to view patients in this workspace.</p>
      ) : !patientId ? (
        <PatientSelector
          onSelect={(id) => {
            setNotification(undefined);
            setPatientId(id);
          }}
        />
      ) : (
        <SecondaryButton
          buttonText="Choose another patient"
          initialState="light"
          disabled={isSaving}
          onClick={() => {
            setNotification(undefined);
            setPatientId('');
            setTab(initialTab);
          }}
        />
      )}
      {canFind && patient && (
        <div className="w-full space-y-6" key={patient.id}>
          <div className="p-6 space-y-3 border-default border-border-primary rounded-default bg-panel-light">
            <h3 className="text-title-small">
              {patient.firstName} {patient.lastName}
            </h3>
            <KeyValueData _key="Birth date" value={patient.birthDate} />
            <KeyValueData _key="Gender" value={patient.gender} />
            <KeyValueData _key="Patient ID" value={patient.id} />
            <KeyValueData
              _key="Working organization"
              value={workspace?.organizationName ?? ''}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <SecondaryButton
              buttonText="Clinical history"
              initialState={tab === 'history' ? 'active' : 'light'}
              disabled={isSaving || !canRead}
              onClick={() => setTab('history')}
            />
            <SecondaryButton
              buttonText="Add clinical record"
              initialState={tab === 'record' ? 'active' : 'light'}
              disabled={isSaving || !canWrite}
              onClick={() => setTab('record')}
            />
          </div>
          {!canRead && <p>You need permission to read clinical history.</p>}
          {!canWrite && (
            <p>
              Adding records needs an active clinical assignment and permission
              to write clinical records.
            </p>
          )}
          {tab === 'history' && canRead && <PatientEHRs patient={patient} />}
          {tab === 'record' && canWrite && (
            <CreateEHR
              patient={patient}
              onSavingChange={setIsSaving}
              onSaved={() => {
                setNotification({
                  type: 'success',
                  title: 'Clinical record saved',
                });
                if (canRead) setTab('history');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
