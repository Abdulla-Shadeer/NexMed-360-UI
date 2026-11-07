import { useForm } from '@tanstack/react-form';
import {
  CreatePractitionerScheduleDto,
  SessionOccurrenceDto,
  AppNotificationType,
} from '@/types';
import { useState } from 'react';
import { SecondaryButton } from '../buttons';
import AppIcon from '../icons/appIcon';
import { IconBell, IconCalendarDays, IconTrash } from '../icons/icons';
import { Form, TextInput, NumberInput, CheckBoxInput } from '../input';
import TimeInput from '../input/timeInput';
import PractitionerRoleSearch from '../search/practitionerRoleSearch';

export default function CreatePractitionerScheduleForm({
  defaultData,
  onFormSubmit,
  onNotification,
}: {
  defaultData: CreatePractitionerScheduleDto;
  onFormSubmit: (data: CreatePractitionerScheduleDto) => void;
  onNotification: (notification: AppNotificationType | undefined) => void;
}) {
  const [
    practitionerRoleUnavailableError,
    setPractitionerRoleUnavailableError,
  ] = useState<string | undefined>(undefined);

  const { Field, Subscribe, handleSubmit, reset, setFieldValue } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      onFormSubmit(value);
      reset(defaultData);
    },
  });

  return (
    <div className="w-full space-y-6">
      {!defaultData.practitionerRoleId && (
        <PractitionerRoleSearch
          onPractitionerRoleSelect={(dr) => {
            // show error if selected practitionerRole isn't available at the organization
            if (dr?.organizationId !== defaultData.organizationId) {
              setFieldValue('practitionerRoleId', '');
              setPractitionerRoleUnavailableError(
                `${dr?.firstName} ${dr?.lastName} isn't available at your organization.`,
              );
            } else {
              setPractitionerRoleUnavailableError(undefined);
              setFieldValue('practitionerRoleId', dr?.id ?? '');
            }
          }}
          onError={(error) => onNotification(error)}
        />
      )}

      {practitionerRoleUnavailableError && (
        <p className="w-full text-red-primary/80 inline-flex gap-2 border-2 rounded-default p-6 bg-red-50 border-red-300">
          <AppIcon icon={IconBell} />
          {practitionerRoleUnavailableError}
        </p>
      )}

      <Form action={handleSubmit} title="Create Practitioner Session">
        <Field
          name="practitionerRoleId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Practitioner ID is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
              disabled={defaultData.practitionerRoleId.length > 0}
            />
          )}
        </Field>

        <Field name="organizationId">
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
