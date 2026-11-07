'use client';

import { useForm } from '@tanstack/react-form';
import { AddClinicalRecordDto, ViewClinicalRecordDto } from '_types/dtos';
import { DateInput, Form, TextInput } from '../input';
import { SecondaryButton } from '../buttons';
import { IconArrowRight, IconDocumentCheck, IconTrash } from '../icons/icons';
import { useState } from 'react';
import { useQueryFunction } from '@/hooks';
import { AppNotificationType } from '_types/common';
import { API_PATHS } from '@/constants';
import { useAuth } from '_context';
import AppLoader from '../misc/loader';

/**
 * This will return partial `AddClinicalRecordDto` without `AddPrescriptionDto`.
 */
export default function CreateEhrForm({
  defaultData,
  onFormSubmit,
  onNotification,
}: {
  defaultData?: AddClinicalRecordDto;
  onFormSubmit: (data: AddClinicalRecordDto) => void;
  onNotification: (Notification: AppNotificationType) => void;
}) {
  const [saveWithoutPrescriptions, setSaveWithoutPrescriptions] =
    useState(false);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const { accessToken } = useAuth();

  async function save(data: AddClinicalRecordDto) {
    const save = createQueryFunction<ViewClinicalRecordDto>({
      path: API_PATHS.addClinicalRecord,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      const savedData = await save();
      onNotification({
        type: 'success',
        title: 'EHR Added Successfully!',
        cause: `EHR Reference: ${savedData.data?.id}`,
      });
      reset(defaultData);
      setSaveWithoutPrescriptions(false);
    } catch (error) {
      const err = error as Error;
      onNotification({
        type: 'error',
        title: 'Error Saving EHR',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      if (saveWithoutPrescriptions) {
        save(value);
      } else {
        onFormSubmit(value);
      }
    },
  });

  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
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

        <Field
          name="visitDate"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Visit Date is required!' : undefined,
          }}
        >
          {(field) => (
            <DateInput
              name={field.name}
              pickedDate={field.state.value}
              onPick={field.handleChange}
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

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
              buttonText="Add Prescriptions"
              initialState="active"
              withIcon
              icon={IconArrowRight}
              onClick={() => {}}
            />

            <SecondaryButton
              type="button"
              buttonText="Save without Prescriptions"
              initialState="light"
              withIcon
              icon={IconDocumentCheck}
              onClick={() => {
                setSaveWithoutPrescriptions(true);
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
                setSaveWithoutPrescriptions(false);
                reset(defaultData);
              }}
            />
          </div>
        </Subscribe>
      </Form>
    </div>
  );
}
