'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from '@tanstack/react-form';
import { Form, TextInput, DateInput, RadioInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { AppNotification } from '@/components/misc';
import { useUser, useWorkspace } from '_context';
import { requestApi } from '_utils/requestApi';
import {
  AppNotificationType,
  ViewPatientDto,
  RegisterPatientDto,
  EnablePatientAccessDto,
} from '@/types';

const accountFields = [
  { name: 'firstName', label: 'First name', type: 'text' },
  { name: 'lastName', label: 'Last name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
] as const;

export default function PatientAccessForm({
  mode,
}: {
  mode: 'signup' | 'enable';
}) {
  const { accessToken } = useUser();
  const { refreshWorkspaces } = useWorkspace();
  const [notification, setNotification] = useState<AppNotificationType>();
  const [isLoading, setIsLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const { Field, handleSubmit, getFieldValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      gender: 'Unknown',
    },
    onSubmit: async ({ value }) => {
      setNotification(undefined);
      setIsLoading(true);
      const details: EnablePatientAccessDto = {
        birthDate: value.birthDate,
        gender: value.gender,
      };
      const signup: RegisterPatientDto = {
        personalInformation: {
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          password: value.password,
        },
        confirmPassword: value.confirmPassword,
        birthDate: value.birthDate,
        gender: value.gender,
      };
      try {
        // These are account operations; a selected work workspace does not apply.
        await requestApi<ViewPatientDto>({
          path:
            mode === 'signup'
              ? '/Users/RegisterPatient'
              : '/Patient/EnableAccess',
          method: 'POST',
          accessToken: mode === 'enable' ? accessToken : undefined,
          payload: mode === 'signup' ? signup : details,
        });
        setComplete(true);
        if (mode === 'enable') {
          try {
            await refreshWorkspaces();
          } catch {
            setNotification({
              type: 'error',
              title: 'Patient access is enabled',
              description:
                'Could not refresh your workspaces. Reload the page to see patient mode.',
            });
            return;
          }
        }
        setNotification({
          type: 'success',
          title:
            mode === 'signup'
              ? 'Your patient account is ready. Please sign in.'
              : 'Patient access is enabled. Choose patient mode from your workspaces.',
        });
      } catch (error) {
        setNotification({
          type: 'error',
          title:
            mode === 'signup'
              ? 'Could not create your account'
              : 'Could not enable patient access',
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full space-y-6">
      {notification && <AppNotification notification={notification} />}
      {complete ? (
        <Link
          href={mode === 'signup' ? '/login' : '/'}
          className="text-blue-secondary hover:text-blue-primary"
        >
          {mode === 'signup' ? 'Continue to login' : 'Open workspaces'}
        </Link>
      ) : (
        <fieldset disabled={isLoading}>
          <Form
            title={
              mode === 'signup'
                ? 'Create patient account'
                : 'Enable patient access'
            }
            action={handleSubmit}
          >
            {mode === 'signup' &&
              accountFields.map((input) => (
                <Field
                  key={input.name}
                  name={input.name}
                  validators={{
                    onChangeListenTo:
                      input.name === 'confirmPassword' ? ['password'] : [],
                    onChange: ({ value }) =>
                      !value.trim()
                        ? `${input.label} is required.`
                        : input.name === 'confirmPassword' &&
                            value !== getFieldValue('password')
                          ? 'Passwords do not match.'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <TextInput
                      name={input.label}
                      type={input.type}
                      value={field.state.value}
                      onChange={field.handleChange}
                      required
                      error={field.state.meta.errorMap.onChange ?? ''}
                    />
                  )}
                </Field>
              ))}
            <Field
              name="birthDate"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Birth date is required.'
                    : value > new Date().toISOString().slice(0, 10)
                      ? 'Birth date cannot be in the future.'
                      : undefined,
              }}
            >
              {(field) => (
                <DateInput
                  name="Birth date"
                  pickedDate={field.state.value}
                  onPick={field.handleChange}
                  required
                  error={field.state.meta.errorMap.onChange ?? ''}
                />
              )}
            </Field>
            <Field name="gender">
              {(field) => (
                <RadioInput
                  name="Gender"
                  selectItems={['Male', 'Female', 'Other', 'Unknown']}
                  selectedItem={field.state.value}
                  onChange={field.handleChange}
                  error=""
                />
              )}
            </Field>
            <SecondaryButton
              buttonText={
                isLoading
                  ? 'Please wait'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Enable patient access'
              }
              initialState="active"
              onClick={() => {}}
              type="submit"
            />
          </Form>
        </fieldset>
      )}
    </div>
  );
}
