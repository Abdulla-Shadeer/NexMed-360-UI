'use client';

import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Form, TextInput } from '../input';
import { SecondaryButton } from '../buttons';
import { IconSend, IconTrash } from '../icons/icons';

interface PatientIdForm {
  patientId: string;
}

export default function PatientIdForm({
  onFormSubmit,
  onReset,
}: {
  onFormSubmit: (patientId: string) => void;
  onReset?: () => void;
}) {
  const [defaultData] = useState<PatientIdForm | undefined>(undefined);

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => onFormSubmit(value.patientId),
  });

  return (
    <div className="w-full space-y-6">
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
            buttonText="Submit"
            onClick={() => {}}
            initialState="active"
            withIcon
            icon={IconSend}
          />
          <SecondaryButton
            type="button"
            buttonText="Reset"
            onClick={() => {
              reset(defaultData);
              if (onReset) onReset();
            }}
            initialState="light"
            withIcon
            icon={IconTrash}
          />
        </Subscribe>
      </Form>
    </div>
  );
}
