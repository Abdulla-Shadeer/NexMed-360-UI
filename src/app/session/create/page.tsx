'use client';

import {
  CheckBoxInput,
  Form,
  NumberInput,
  TextInput,
} from '@/components/input';
import DoctorSearch from '@/components/search/doctorSearch';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import {
  AppNotification as AppNotificationType,
  CreateDoctorSessionDto,
  SessionOccurrenceDto,
  ViewDoctorSessionDto,
} from '@/types';
import { useMemo, useState } from 'react';
import TimeInput from '@/components/input/timeInput';
import { SecondaryButton } from '@/components/buttons';
import {
  IconBell,
  IconCalendarDays,
  IconTrash,
} from '@/components/icons/icons';
import AppLoader from '@/components/misc/loader';
import { AppNotification } from '@/components/misc';
import { apiPaths } from '@/constants';
import AppIcon from '@/components/icons/appIcon';

export default function CreateSessionPage() {
  const { accessToken, user } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const defaultData = useMemo<CreateDoctorSessionDto>(() => {
    return {
      doctorId: user?.doctorProfile?.id ?? '',
      hospitalId:
        user?.doctorProfile?.hospitalId ??
        user?.hospitalAdminProfile?.hospitalId ??
        '',
      startTime: '',
      endTime: '',
      slotDurationMinutes: 30,
      occurrences: [],
    };
  }, [user]);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [doctorUnavailableError, setDoctorUnavailableError] = useState<
    string | undefined
  >(undefined);

  async function createSession(data: CreateDoctorSessionDto) {
    data.startTime = data.startTime.concat(':00');
    data.endTime = data.endTime.concat(':00');
    const create = createQueryFunction<ViewDoctorSessionDto>({
      path: apiPaths.createDoctorSession,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const res = await create();
      setNotification({
        type: 'success',
        title: 'Session Created Successfully!',
        description: `Reference: ${res.data?.id}`,
        cause: `Occurs on : ${res.data?.occurrences.join(', ')}`,
      });
      reset(defaultData);
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error creating Session!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  const { Field, Subscribe, handleSubmit, reset, setFieldValue } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => createSession(value),
  });

  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}

      {!defaultData.doctorId && (
        <DoctorSearch
          onDoctorSelect={(dr) => {
            // show error if selected doctor isn't available at the hospital
            if (dr?.hospitalId !== defaultData.hospitalId) {
              setFieldValue('doctorId', '');
              setDoctorUnavailableError(
                `Dr. ${dr?.firstName} ${dr?.lastName} isn't available at your hospital.`,
              );
            } else {
              setDoctorUnavailableError(undefined);
              setFieldValue('doctorId', dr?.id ?? '');
            }
          }}
          onError={(error) => setNotification(error)}
        />
      )}

      {doctorUnavailableError && (
        <p className="w-full text-red-primary/80 inline-flex gap-2 border-2 rounded-default p-6 bg-red-50 border-red-300">
          <AppIcon icon={IconBell} />
          {doctorUnavailableError}
        </p>
      )}

      <Form action={handleSubmit} title="Create Doctor Session">
        <Field
          name="doctorId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Doctor ID is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
              disabled={defaultData.doctorId.length > 0}
            />
          )}
        </Field>

        <Field name="hospitalId">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error=""
              required
              disabled
            />
          )}
        </Field>

        <Field
          name="startTime"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Start Time is Required!' : undefined,
          }}
        >
          {(field) => (
            <TimeInput
              name={field.name}
              pickedTime={field.state.value}
              onPick={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
            />
          )}
        </Field>

        <Field
          name="endTime"
          validators={{
            onChange: ({ value }) =>
              !value ? 'End Time is Required!' : undefined,
          }}
        >
          {(field) => (
            <TimeInput
              name={field.name}
              pickedTime={field.state.value}
              onPick={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
            />
          )}
        </Field>

        <Field name="slotDurationMinutes">
          {(field) => (
            <NumberInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error=""
            />
          )}
        </Field>

        <Field
          name="occurrences"
          validators={{
            onChange: ({ value }) =>
              value.length <= 0 ? 'Occurrence is Required!' : undefined,
          }}
        >
          {(field) => (
            <CheckBoxInput
              name={field.name}
              checkItems={Object.keys(SessionOccurrenceDto)}
              checkedItems={field.state.value}
              onChange={(value) =>
                field.handleChange(value as SessionOccurrenceDto[])
              }
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Subscribe>
          <div className="w-full inline-flex gap-6">
            <SecondaryButton
              type="submit"
              buttonText="Create Session"
              withIcon
              icon={IconCalendarDays}
              initialState="active"
              onClick={() => {}}
            />

            <SecondaryButton
              type="button"
              buttonText="Reset"
              withIcon
              icon={IconTrash}
              initialState="light"
              onClick={() => reset(defaultData)}
            />
          </div>
        </Subscribe>
      </Form>
    </div>
  );
}
