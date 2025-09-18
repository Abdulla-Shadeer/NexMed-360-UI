'use client';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput } from '@/components/input';
import AppIcon from '@/components/icons/appIcon';
import { IconArrowLeft, IconSend, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { ViewUserDto } from '_types/dtos';
import Link from 'next/link';
import { useState } from 'react';

interface UpdateUserDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export default function EditAppointment() {
  const { accessToken, user, refetchUser } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [defaultData] = useState<UpdateUserDto>({
    id: user?.id ?? '',
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
  });
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  async function dispatchUpdate(data: UpdateUserDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: apiPaths.updateUser,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({ type: 'success', title: 'Successfully Updated!' });
      refetchUser();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Update Failed!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
      reset(defaultData);
    }
  }

  function handleUpdate(value: UpdateUserDto) {
    if (defaultData !== value) {
      const modifyDto: UpdateUserDto = {
        id: value.id,
        firstName:
          defaultData?.firstName !== value.firstName
            ? value.firstName
            : undefined,
        lastName:
          defaultData?.lastName !== value.lastName ? value.lastName : undefined,
        phoneNumber:
          defaultData?.phoneNumber !== value.phoneNumber
            ? value.phoneNumber
            : undefined,
        email: defaultData?.email !== value.email ? value.email : undefined,
      };
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
      <Link
        href={'/account'}
        className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary mb-6"
      >
        <AppIcon icon={IconArrowLeft} />
        Go back
      </Link>

      {defaultData && (
        <Form title="Update User" action={handleSubmit}>
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
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value ? 'First name is required' : undefined,
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
            name="lastName"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Last name is required' : undefined,
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
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Email is required' : undefined,
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
          <Field name="phoneNumber">
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
