'use client';

import { SecondaryButton } from '@/components/buttons';
import PatientEHRs from '@/components/ehr/patientEhrs';
import { Form, TextInput } from '@/components/form';
import { IconSearch, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { AppNotification as AppNotificationType } from '_types/common';
import { ViewPatientDto } from '_types/dtos';
import { useState } from 'react';

interface PatientIdForm {
  patientId: string;
}

export default function FindEhrPage() {
  const [defaultData] = useState<PatientIdForm | undefined>(undefined);
  const [patient, setPatient] = useState<ViewPatientDto | undefined>(undefined);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const { accessToken } = useAuth();

  async function fetchPatientData(id: string) {
    const getPatient = createQueryFunction<ViewPatientDto>({
      path: apiPaths.getPatient(id),
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

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => fetchPatientData(value.patientId),
  });

  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <Form action={handleSubmit} title="Enter/Scan Patient ID">
        <Field
          name="patientId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Patient ID is required' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
            />
          )}
        </Field>
        <Subscribe>
          <SecondaryButton
            type="submit"
            buttonText="Find EHRs"
            onClick={() => {}}
            initialState="active"
            withIcon
            icon={IconSearch}
          />
          <SecondaryButton
            type="button"
            buttonText="Reset"
            onClick={() => {
              reset(defaultData);
              setPatient(undefined);
            }}
            initialState="light"
            withIcon
            icon={IconTrash}
          />
        </Subscribe>
      </Form>
      {patient && (
        <PatientEHRs
          patient={patient}
          onNotification={(notification) => setNotification(notification)}
        />
      )}
    </div>
  );
}
