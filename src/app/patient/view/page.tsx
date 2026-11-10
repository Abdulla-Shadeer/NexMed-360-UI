'use client';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useUser } from '_context';
import { AppNotificationType, ViewPatientDto } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLoader from '@/components/misc/loader';
import { AppNotification } from '@/components/misc';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { Form, TextInput } from '@/components/input';
import { useForm } from '@tanstack/react-form';
import { SecondaryButton } from '@/components/buttons';
import { IconSearch, IconTrash } from '@/components/icons/icons';

interface PatientIdForm {
  patientId: string;
}

export default function ViewPatientPage() {
  const searchParams = useSearchParams();
  const [patientId] = useState(searchParams.get('id'));
  const [defaultData] = useState<PatientIdForm>({ patientId: patientId ?? '' });
  const [patientData, setPatientData] = useState<ViewPatientDto | undefined>(
    undefined,
  );
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();

  async function fetchPatient(id: string) {
    const request = createQueryFunction<ViewPatientDto>({
      path: API_PATHS.getPatient(id),
      method: 'GET',
      accessToken,
    });

    try {
      setNotification(undefined);
      const result = await request();
      setPatientData(result.data);
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Failed to get Patient data!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchPatient(patientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => fetchPatient(value.patientId),
  });

  return (
    <div>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <Form action={handleSubmit} title="Find Patient">
        <Field
          name="patientId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Patient Id required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Subscribe>
          <SecondaryButton
            type="submit"
            buttonText="Find"
            withIcon
            icon={IconSearch}
            initialState="active"
            onClick={() => {}}
          />
          <SecondaryButton
            type="button"
            buttonText="Clear"
            withIcon
            icon={IconTrash}
            initialState="light"
            onClick={() => {
              reset(defaultData);
              setPatientData(undefined);
            }}
          />
        </Subscribe>
      </Form>
      {patientData && unknownObjectRenderer(patientData, 'Patient Info')}
    </div>
  );
}
