import { useForm } from '@tanstack/react-form';
import { SessionOccurrenceDto, UpdatePractitionerScheduleDto } from '@/types';
import { SecondaryButton } from '../buttons';
import { IconCalendarDays, IconTrash } from '../icons/icons';
import { Form, NumberInput, CheckBoxInput } from '../input';
import TimeInput from '../input/timeInput';

export default function UpdatePractitionerScheduleForm({
  defaultData,
  onFormSubmit,
}: {
  defaultData: UpdatePractitionerScheduleDto;
  onFormSubmit: (data: UpdatePractitionerScheduleDto) => void;
}) {
  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      value.startTime =
        value.startTime.split(':').length === 3
          ? value.startTime
          : value.startTime.concat(':00');
      value.endTime =
        value.endTime.split(':').length === 3
          ? value.endTime
          : value.endTime.concat(':00');
      onFormSubmit(value);
      reset(defaultData);
    },
  });

  return (
    <div className="w-full space-y-6">
      <Form action={handleSubmit} title="Update Practitioner Session">
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
              !value || value.length <= 0
                ? 'Occurrence is Required!'
                : undefined,
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
              buttonText="Update Session"
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
