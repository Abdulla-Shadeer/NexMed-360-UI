'use client';

import { useForm } from '@tanstack/react-form';
import { AddPrescriptionDto } from '_types/dtos';
import {
  CheckBoxInput,
  Form,
  NumberInput,
  TextAreaInput,
  TextInput,
} from '../input';
import { SecondaryButton } from '../buttons';
import { IconDocumentPlus, IconTrash } from '../icons/icons';

export default function CreatePrescription({
  defaultData,
  onFormSubmit,
}: {
  defaultData: AddPrescriptionDto;
  onFormSubmit: (data: AddPrescriptionDto) => void;
}) {
  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      onFormSubmit(value);
      reset(defaultData);
    },
  });

  return (
    <div className="w-full z-10">
      <Form action={handleSubmit} title="Create Prescription">
        <Field
          name="medicineName"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Medicine name is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
              disabled={defaultData.medicineName.length > 0}
            />
          )}
        </Field>

        <Field
          name="dosage"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Dosage is required!' : undefined,
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

        <Field
          name="timesPerDay"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Frequency is required!' : undefined,
          }}
        >
          {(field) => (
            <NumberInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
            />
          )}
        </Field>

        <Field name="isLongTermUse">
          {(field) => (
            <CheckBoxInput
              name={field.name}
              checkItems={['yes']}
              checkedItems={
                defaultData?.isLongTermUse === true ? ['yes'] : undefined
              }
              onChange={(value) => {
                if (value.some((v) => v === 'yes')) {
                  field.handleChange(true);
                } else {
                  field.handleChange(false);
                }
              }}
              error=""
            />
          )}
        </Field>

        <Field name="duration">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
            />
          )}
        </Field>

        <Field name="notes">
          {(field) => (
            <TextAreaInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
            />
          )}
        </Field>

        <Subscribe>
          <div className="w-full inline-flex gap-6">
            <SecondaryButton
              type="submit"
              buttonText="Add to List"
              initialState="active"
              withIcon
              icon={IconDocumentPlus}
              onClick={() => {}}
            />

            <SecondaryButton
              type="button"
              buttonText="Reset"
              initialState="light"
              withIcon
              icon={IconTrash}
              onClick={() => reset(defaultData)}
            />
          </div>
        </Subscribe>
      </Form>
    </div>
  );
}
