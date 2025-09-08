'use client';

import ButtonSecondary from '@/components/buttons/buttonSecondary';
import { DateInput, Form, RadioInput, TextInput } from '@/components/form';
import AppLoader from '@/components/misc/loader';
import AppNotification from '@/components/misc/appNotification';
import { apiPaths, userRoles } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification as AppNotificationType,
  CreateAppointmentDto,
  ViewAppointmentDto,
} from '@/types';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { useEffect, useMemo, useState } from 'react';
import { EntitySearch } from '@/components/misc';
import { toDisplayDateTimeFormat } from '_utils/dateUtils';
import { IconClock, IconTrash } from '@/components/icons/icons';

export default function CreateAppointment() {
  const { accessToken, user } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [appointmentType, setappointmentType] = useState<'mySelf' | 'patient'>(
    !user?.roles.includes(userRoles.patient) ? 'patient' : 'mySelf',
  );
  const defaultValues = useMemo(() => {
    const defaultValues: CreateAppointmentDto = {
      patientId:
        appointmentType === 'mySelf' ? (user?.patientProfile?.id ?? '') : '',
      doctorId: '',
      hospitalId:
        appointmentType === 'patient'
          ? (user?.receptionistProfile?.hospitalId ?? '')
          : '',
      appointmentDateTime: '',
      remarks: '',
    };
    return defaultValues;
  }, [user, appointmentType]);

  async function createAppointment(value: CreateAppointmentDto) {
    const postRequest = createQueryFunction<ViewAppointmentDto>({
      method: 'POST',
      accessToken: accessToken,
      path: apiPaths.createAppointment,
      payload: value,
    });

    try {
      const res = await postRequest();
      if (res.isSuccess) {
        setNotification({
          type: 'success',
          title: 'Appointment created successfully!',
          description: `Please be prepared on ${toDisplayDateTimeFormat(new Date(res.data?.appointmentDateTime ?? ''))}`,
          cause: `Your appointment ID: ${res.data?.bookingReference}`,
        });
      } else {
        setNotification({
          type: 'error',
          title: 'Appointment failed!',
          description: res.error?.title,
          cause: res.error?.description,
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Appointment failed!',
        description: (error as Error).message,
        cause: (error as Error).cause as string,
      });
    }
  }

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultValues,
    async onSubmit({ value }) {
      setNotification(undefined);
      await createAppointment(value);
    },
  });

  useEffect(() => {
    if (notification?.type === 'success') {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  return (
    <div>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <EntitySearch />

      {user?.roles.length && user.roles.length > 1 && (
        <RadioInput
          name="Who is this appointment for?"
          selectItems={['mySelf', 'patient']}
          selectedItem={appointmentType}
          onChange={(value) =>
            setappointmentType(value as 'mySelf' | 'patient')
          }
          error=""
        />
      )}

      <Form action={handleSubmit} title="Create Appointment">
        <Field
          name="patientId"
          validators={{
            onChange: ({ value }) => (!value ? 'Patient ID is required!' : ''),
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              required
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              error={field.state.meta.errorMap.onChange ?? ''}
              disabled={appointmentType === 'mySelf'}
            />
          )}
        </Field>

        <Field
          name="doctorId"
          validators={{
            onChange: ({ value }) => (!value ? 'Doctor ID is required!' : ''),
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              required
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Field
          name="hospitalId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Hospital ID is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              required
              value={field.state.value}
              onChange={(v) => field.handleChange(v)}
              error={field.state.meta.errorMap.onChange ?? ''}
              disabled={appointmentType === 'patient'}
            />
          )}
        </Field>

        <Field
          name="appointmentDateTime"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Appointment Date and Time is required!' : '',
          }}
        >
          {(field) => (
            <DateInput
              name={field.name}
              required
              withTime
              pickedDate={field.state.value}
              onPick={(d) => field.handleChange(d)}
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Field name="remarks">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(v) => field.handleChange(v)}
              error=""
            />
          )}
        </Field>

        <div className="w-full inline-flex gap-6">
          <Subscribe>
            <ButtonSecondary
              type="submit"
              buttonText="Create"
              initialState="active"
              onClick={() => {}}
              withIcon
              icon={IconClock}
            />
            <ButtonSecondary
              type="button"
              buttonText="Clear"
              initialState="light"
              onClick={() => reset()}
              withIcon
              icon={IconTrash}
            />
          </Subscribe>
        </div>
      </Form>
    </div>
  );
}
