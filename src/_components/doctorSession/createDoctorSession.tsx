import { useForm } from '@tanstack/react-form';
import {
  CreateDoctorSessionDto,
  SessionOccurrenceDto,
  AppNotificationType,
} from '@/types';
import { useState } from 'react';
import { SecondaryButton } from '../buttons';
import AppIcon from '../icons/appIcon';
import { IconBell, IconCalendarDays, IconTrash } from '../icons/icons';
import { Form, TextInput, NumberInput, CheckBoxInput } from '../input';
import TimeInput from '../input/timeInput';
import DoctorSearch from '../search/doctorSearch';

export default function CreateDoctorSessionForm({
  defaultData,
  onFormSubmit,
  onNotification,
}: {
  defaultData: CreateDoctorSessionDto;
  onFormSubmit: (data: CreateDoctorSessionDto) => void;
  onNotification: (notification: AppNotificationType | undefined) => void;
}) {
  const [doctorUnavailableError, setDoctorUnavailableError] = useState<
    string | undefined
  >(undefined);

  const { Field, Subscribe, handleSubmit, reset, setFieldValue } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      onFormSubmit(value);
      reset(defaultData);
    },
  });

  return (
    <div className="w-full space-y-6">
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
          onError={(error) => onNotification(error)}
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
