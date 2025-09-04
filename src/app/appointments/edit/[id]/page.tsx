'use client';
import { SecondaryButton } from '@/components/buttons';
import QuickActionButton from '@/components/buttons/quickActionButton';
import { DateInput, Form, TextInput } from '@/components/form';
import { IconArrowLeft, IconSend, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { AppNotification as AppNotificationType } from '_types/common';
import { ModifyAppointmentDto, ViewAppointmentDto } from '_types/dtos';
import { toDefaultDateTimeFormat } from '_utils/dateUtils';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditAppointment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [defaultData, setDefaultData] = useState<
    ModifyAppointmentDto | undefined
  >(undefined);
  const router = useRouter();

  useEffect(() => {
    async function fetchAppointmentData() {
      const request = createQueryFunction<ViewAppointmentDto>({
        path: apiPaths.viewAppointmentById(id),
        method: 'GET',
        accessToken,
      });

      try {
        const response = await request();
        const newDefaultData = {
          id: response.data?.id ?? '',
          patientId: response.data?.patientId,
          doctorId: response.data?.doctorId,
          appointmentDateTime: toDefaultDateTimeFormat(
            response.data?.appointmentDateTime ?? '',
          ),
          remarks: response.data?.remarks,
        };
        setDefaultData(newDefaultData);
        reset(newDefaultData);
      } catch (error) {
        const err = error as Error;
        setNotification({
          type: 'error',
          title: 'Failed to fetch appointment data!',
          description: err.message,
        });
      }
    }

    fetchAppointmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function dispatchUpdate(data: ModifyAppointmentDto) {
    const request = createQueryFunction<ViewAppointmentDto>({
      path: apiPaths.editAppointment,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const updateResponse = await request();
      const newDefaultData = {
        id: updateResponse.data?.id ?? '',
        patientId: updateResponse.data?.patientId,
        doctorId: updateResponse.data?.doctorId,
        appointmentDateTime: toDefaultDateTimeFormat(
          updateResponse.data?.appointmentDateTime ?? '',
        ),
        remarks: updateResponse.data?.remarks,
      };
      setDefaultData(newDefaultData);
      reset(newDefaultData);
      setNotification({ type: 'success', title: 'Successfully Updated!' });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Update Failed!',
        description: err.message,
      });
      reset(defaultData);
    }
  }

  function handleUpdate(value: ModifyAppointmentDto) {
    if (defaultData !== value) {
      const modifyDto: ModifyAppointmentDto = {
        id: value.id,
        patientId:
          defaultData?.patientId !== value.patientId
            ? value.patientId
            : undefined,
        doctorId:
          defaultData?.doctorId !== value.doctorId ? value.doctorId : undefined,
        appointmentDateTime:
          defaultData?.appointmentDateTime !== value.appointmentDateTime
            ? value.appointmentDateTime
            : undefined,
        remarks:
          defaultData?.remarks !== value.remarks ? value.remarks : undefined,
      };
      console.log(`Dirty fields: ${JSON.stringify(modifyDto)}`);
      dispatchUpdate(modifyDto);
    }
  }

  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: defaultData,
    onSubmit: async ({ value }) => handleUpdate(value),
  });

  return (
    <div>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}

      <QuickActionButton
        text="Go back"
        icon={IconArrowLeft}
        onClick={router.back}
      />

      {defaultData && (
        <Form title="Update Appointment" action={handleSubmit}>
          <Field name="id">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error=""
                required
                onChange={() => {}}
                disabled
              />
            )}
          </Field>
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
                value={field.state.value ?? ''}
                error={field.state.meta.errorMap.onChange ?? ''}
                required
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>
          <Field
            name="doctorId"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Doctor ID is required' : undefined,
            }}
          >
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error={field.state.meta.errorMap.onChange ?? ''}
                required
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>
          <Field
            name="appointmentDateTime"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Appointment date and Time required' : undefined,
            }}
          >
            {(field) => (
              <DateInput
                name={field.name}
                pickedDate={field.state.value}
                error={field.state.meta.errorMap.onChange ?? ''}
                required
                withTime
                onPick={(value) => field.handleChange(value)}
              />
            )}
          </Field>
          <Field name="remarks">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error=""
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>

          <div className="w-full flex flex-row gap-4">
            <Subscribe>
              <SecondaryButton
                type="submit"
                buttonText="Update"
                initialState="active"
                onClick={() => {}}
                withIcon
                icon={IconSend}
              />
              <SecondaryButton
                type="button"
                buttonText="Reset"
                initialState="light"
                onClick={() => reset(defaultData)}
                withIcon
                icon={IconTrash}
              />
            </Subscribe>
          </div>
        </Form>
      )}
    </div>
  );
}
