'use client';
import { SecondaryButton } from '@/components/buttons';
import { Form, SelectInput, TextInput } from '@/components/form';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import {
  AppNotification as AppNotificationType,
  KeyValuePair,
} from '_types/common';
import {
  CreateHospitalAdminDto,
  RegisterUserDto,
  ViewHospitalDto,
  ViewUserDto,
} from '_types/dtos';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AssignAdminPage() {
  const searchParams = useSearchParams();
  const [hospitalId, setHospitalId] = useState<string | undefined>(
    searchParams.get('id') ?? undefined,
  );
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto[]>({
    path: apiPaths.getAllHospitals,
    method: 'GET',
    accessToken,
  });
  const [defaultValues] = useState<RegisterUserDto | undefined>(undefined);
  const [hospitalIdValidationError, setHospitalIdValidationError] =
    useState(false);
  const { createQueryFunction } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [isAdding, setIsAdding] = useState(false);

  async function dispatchCreateRequest(dto: CreateHospitalAdminDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: apiPaths.assignHospitalAdmin,
      method: 'POST',
      accessToken,
      payload: dto,
    });

    try {
      setIsAdding(true);
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: 'Success!',
        description: 'Admin user assigned.',
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error assigning Admin!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    } finally {
      setIsAdding(false);
    }
  }

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultValues,
    onSubmit: ({ value }) => {
      if (!hospitalId) {
        setHospitalIdValidationError(true);
      } else {
        // call update method
        const dto: CreateHospitalAdminDto = {
          hospitalId,
          personalInformation: value,
        };
        dispatchCreateRequest(dto);
      }
    },
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {(isLoading || isAdding) && <AppLoader />}
      <Form title="Assign Admin" action={handleSubmit}>
        {data && (
          <SelectInput
            name="Select Hospital"
            required
            options={data.map((hs) => {
              const option: KeyValuePair<string, string> = {
                key: hs.id,
                value: hs.name,
              };
              return option;
            })}
            selected={hospitalId}
            onSelect={(value) => {
              setHospitalId(value);
              setHospitalIdValidationError(false);
            }}
            error={hospitalIdValidationError ? 'Please select a Hospital!' : ''}
          />
        )}
        <Field
          name="firstName"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Firstname required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(value) => field.handleChange(value)}
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Field
          name="lastName"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Lastname required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(value) => field.handleChange(value)}
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Email is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              type="email"
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(value) => field.handleChange(value)}
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <Field name="phoneNumber">
          {(field) => (
            <TextInput
              type="tel"
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(value) => field.handleChange(value)}
              error=""
            />
          )}
        </Field>

        <Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Password is required!' : undefined,
          }}
        >
          {(field) => (
            <TextInput
              type="password"
              name={field.name}
              value={field.state.value ?? ''}
              onChange={(value) => field.handleChange(value)}
              required
              error={field.state.meta.errorMap.onChange ?? ''}
            />
          )}
        </Field>

        <div className="w-full inline-flex gap-4 items-center">
          <Subscribe>
            <SecondaryButton
              type="submit"
              buttonText="Submit"
              initialState="active"
              onClick={() => {}}
            />
            <SecondaryButton
              type="button"
              buttonText="Clear"
              initialState="light"
              onClick={() => {
                reset(defaultValues);
              }}
            />
          </Subscribe>
        </div>
      </Form>
    </div>
  );
}
