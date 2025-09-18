'use client';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput } from '@/components/input';
import AppIcon from '@/components/icons/appIcon';
import { IconArrowLeft, IconSend, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { UpdateHospitalDto, ViewHospitalDto } from '_types/dtos';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function EditHospital({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto>({
    path: apiPaths.getHospitalById(id),
    method: 'GET',
    accessToken,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { createQueryFunction } = useQueryFunction();

  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [defaultData, setDefaultData] = useState<UpdateHospitalDto | undefined>(
    data,
  );

  useEffect(() => {
    if (data) {
      setDefaultData(data);
    }
  }, [data]);

  async function dispatchUpdate(data: UpdateHospitalDto) {
    const request = createQueryFunction<ViewHospitalDto>({
      path: apiPaths.updateHospital,
      method: 'PUT',
      accessToken,
      payload: data,
    });

    try {
      setIsUpdating(true);
      setNotification(undefined);
      const updateResponse = await request();
      const newDefaultData = {
        id: updateResponse.data?.id ?? '',
        name: updateResponse.data?.name,
        street: updateResponse.data?.street,
        city: updateResponse.data?.city,
        district: updateResponse.data?.district,
        phone: updateResponse.data?.phone,
        grade: updateResponse.data?.grade,
      };
      setDefaultData(newDefaultData);
      reset(newDefaultData);
      setNotification({ type: 'success', title: 'Successfully Updated!' });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Update Failed!',
        description: err.message,
        cause: err.cause ? err.cause.toString() : undefined,
      });
      reset(defaultData);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleUpdate(value: UpdateHospitalDto) {
    if (defaultData !== value) {
      const modifyDto: UpdateHospitalDto = {
        id: value.id,
        name: defaultData?.name !== value.name ? value.name : undefined,
        street: defaultData?.street !== value.street ? value.street : undefined,
        city: defaultData?.city !== value.city ? value.city : undefined,
        district:
          defaultData?.district !== value.district ? value.district : undefined,
        phone: defaultData?.phone !== value.phone ? value.phone : undefined,
        grade: defaultData?.grade !== value.grade ? value.grade : undefined,
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
      {(isLoading || isUpdating) && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      {error && <AppNotification notification={error} />}
      <button
        onClick={router.back}
        className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary mb-6 cursor-pointer"
      >
        <AppIcon icon={IconArrowLeft} />
        Go back
      </button>

      {data && (
        <Form title="Update hospital" action={handleSubmit}>
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
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Name is required' : undefined,
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
          <Field name="street">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error=""
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>
          <Field name="city">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error=""
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>
          <Field name="district">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                error=""
                onChange={(value) => field.handleChange(value)}
              />
            )}
          </Field>

          <Field
            name="phone"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Phone is required' : undefined,
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

          <Field name="grade">
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
