'use client';

import { useRef, useState } from 'react';
import { Form, SelectInput, TextInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useUser } from '_context';
import { AppNotificationType, ViewPatientDto } from '@/types';

export default function PatientSelector({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [inputType, setInputType] = useState('name');
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ViewPatientDto[]>();
  const [notification, setNotification] = useState<AppNotificationType>();
  const requestVersion = useRef(0);
  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();

  function clearResults() {
    ++requestVersion.current;
    setResults(undefined);
    setNotification(undefined);
  }

  async function search() {
    const value = input.trim();
    if (!value) return;
    clearResults();
    if (inputType === 'id') {
      onSelect(value);
      return;
    }
    const version = requestVersion.current;
    try {
      const response = await createQueryFunction<ViewPatientDto[]>({
        path: API_PATHS.entitySearch,
        method: 'POST',
        accessToken,
        payload: { entity: 'patient', inputType, input: value },
      })();
      // Do not show results for search text that has since changed.
      if (version === requestVersion.current) setResults(response.data ?? []);
    } catch (error) {
      if (version === requestVersion.current)
        setNotification({
          type: 'error',
          title: 'Could not search patients',
          description: (error as Error).message,
        });
    }
  }

  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <Form title="Find patient" action={search}>
        <SelectInput
          name="Search by"
          selected={inputType}
          options={[
            { key: 'name', value: 'Name' },
            { key: 'email', value: 'Email' },
            { key: 'id', value: 'Patient ID' },
          ]}
          onSelect={(value) => {
            clearResults();
            setInputType(value);
            setInput('');
          }}
          error=""
        />
        <TextInput
          name={
            inputType === 'id'
              ? 'Patient ID'
              : inputType === 'email'
                ? 'Email'
                : 'Patient name'
          }
          value={input}
          onChange={(value) => {
            clearResults();
            setInput(value);
          }}
          required
          error=""
        />
        <SecondaryButton
          type="submit"
          buttonText="Find patient"
          initialState="active"
          disabled={isLoading || !input.trim()}
          onClick={() => {}}
        />
      </Form>
      {results?.length === 0 && <p>No matching patients in your workspace.</p>}
      {results && (
        <div className="w-full flex flex-wrap gap-6">
          {results.map((patient) => (
            <div
              key={patient.id}
              className="space-y-3 p-6 border-default border-border-primary rounded-default bg-panel-light"
            >
              <h3 className="text-title-small">
                {patient.firstName} {patient.lastName}
              </h3>
              <p>Birth date: {patient.birthDate}</p>
              {patient.email && <p>{patient.email}</p>}
              <p>Patient ID: {patient.id}</p>
              <SecondaryButton
                buttonText="Open patient"
                initialState="active"
                onClick={() => onSelect(patient.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
