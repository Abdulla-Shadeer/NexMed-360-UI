'use client';

import { useForm } from '@tanstack/react-form';
import { AddClinicalRecordDto } from '_types/dtos';
import { DateInput, Form, TextInput } from '../input';
import { SecondaryButton } from '../buttons';
import { IconArrowRight, IconDocumentCheck, IconTrash } from '../icons/icons';
import { useRef } from 'react';

/**
 * This will return partial `AddClinicalRecordDto` without `AddPrescriptionDto`.
 */
export default function CreateEhrForm({
  defaultData,
  onFormSubmit,
  onSave,
}: {
  defaultData?: AddClinicalRecordDto;
  onFormSubmit: (data: AddClinicalRecordDto) => void;
  onSave: (data: AddClinicalRecordDto) => void;
}) {
  const saveWithoutPrescriptions = useRef(false);

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      if (saveWithoutPrescriptions.current) {
        onSave(value);
      } else {
        onFormSubmit(value);
      }
    },
  });

  return (
    <div className="w-full">
      <Form action={handleSubmit} title="Create EHR">
        <Field
          name="patientId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Patient ID is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
              required
              disabled={
                defaultData?.patientId !== undefined &&
                defaultData?.patientId.length > 0
              }
            />
          )}
        </Field>

        <Field
          name="diagnosis"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Diagnosis is required!' : undefined,
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

        <Field name="practitionerNotes">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
            />
          )}
        </Field>

        <p>The record date and author are set when you save.</p>

        <Field name="followUpDate">
          {(field) => (
            <DateInput
              name={field.name}
              pickedDate={field.state.value}
              onPick={field.handleChange}
              error=""
            />
          )}
        </Field>

        <Subscribe>
          <div className="w-full inline-flex gap-6 flex-wrap">
            <SecondaryButton
              type="submit"
              buttonText="Add prescriptions (optional)"
              initialState="active"
              withIcon
              icon={IconArrowRight}
              onClick={() => {
                saveWithoutPrescriptions.current = false;
              }}
            />

            <SecondaryButton
              type="button"
              buttonText="Save without Prescriptions"
              initialState="light"
              withIcon
              icon={IconDocumentCheck}
              onClick={() => {
                saveWithoutPrescriptions.current = true;
                handleSubmit();
              }}
            />

            <SecondaryButton
              type="button"
              buttonText="Reset"
              initialState="light"
              withIcon
              icon={IconTrash}
              onClick={() => {
                saveWithoutPrescriptions.current = false;
                reset(defaultData);
              }}
            />
          </div>
        </Subscribe>
      </Form>
    </div>
  );
}
