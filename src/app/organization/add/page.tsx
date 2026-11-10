'use client';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput } from '@/components/input';
import { IconArrowRight, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useUser } from '_context';
import {
  CreateOrganizationManagerDto,
  CreateOrganizationDto,
  ViewOrganizationDto,
  ViewUserDto,
  AppNotificationType,
} from '@/types';
import { useState } from 'react';
import AddUserForm from '@/components/organization/addUserForm';

const stepButtonStyle =
  'text-default text-left py-1 px-2 border-border-primary border-default cursor-pointer';

export default function AddOrganization() {
  const [step, setStep] = useState<'one' | 'two'>('one');
  const [defaultOrganizationData, setDefaultOrganizationData] = useState<
    CreateOrganizationDto | undefined
  >(undefined);

  const { accessToken } = useUser();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [createdOrganizationId, setCreatedOrganizationId] = useState<
    string | undefined
  >(undefined);

  async function dispatchCreateOrganization(data: CreateOrganizationDto) {
    const request = createQueryFunction<ViewOrganizationDto>({
      path: API_PATHS.addOrganization,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const response = await request();
      setCreatedOrganizationId(response.data?.id);
      setDefaultOrganizationData(undefined);
      setStep('two');
      setNotification({
        type: 'success',
        title: 'Organization Added Successfully!',
        description: `Organization ID: ${response.data?.id}`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Failed to create Organization!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  async function dispatchAssignAdmin(data: CreateOrganizationManagerDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: API_PATHS.assignOrganizationManager,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const response = await request();
      setCreatedOrganizationId(undefined);
      setDefaultOrganizationData(undefined);
      setNotification({
        type: 'success',
        title: 'Admin User Assigned!',
        description: `Admin ID: ${response.data?.id}`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Failed to assign Admin!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <div className="flex flex-row items-center gap-1">
        <button
          type="button"
          onClick={() => setStep('one')}
          className={`${stepButtonStyle} ${step === 'one' ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
        >
          Step 01
        </button>
        <button
          type="button"
          onClick={() => setStep('two')}
          className={`${stepButtonStyle} ${step === 'two' ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
        >
          Step 02
        </button>
      </div>
      {step === 'one' && (
        <OrganizationInfo
          defaultData={defaultOrganizationData}
          submitCallback={(data) => {
            setDefaultOrganizationData(data);
            dispatchCreateOrganization(data);
          }}
        />
      )}

      {step === 'two' && (
        <AddUserForm
          userType="organizationManager"
          onFormSubmit={(data) => {
            dispatchAssignAdmin(data as CreateOrganizationManagerDto);
          }}
          organizationId={createdOrganizationId}
        />
      )}
    </div>
  );
}

function OrganizationInfo({
  submitCallback,
  defaultData,
}: {
  submitCallback: (data: CreateOrganizationDto) => void;
  defaultData: CreateOrganizationDto | undefined;
}) {
  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => submitCallback(value),
  });

  return (
    <Form title="Organization Info" action={handleSubmit}>
      <Field
        name="name"
        validators={{
          onChange: ({ value }) => (!value ? 'Name required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field name="street">
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
        name="city"
        validators={{
          onChange: ({ value }) => (!value ? 'City required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="district"
        validators={{
          onChange: ({ value }) => (!value ? 'District required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="phone"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Phone Number required!' : undefined,
        }}
      >
        {(field) => (
          <TextInput
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field name="type">
        {(field) => (
          <TextInput
            name={field.name}
            description="For example, Hospital or Clinic"
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            error=""
          />
        )}
      </Field>

      <Field name="grade">
        {(field) => (
          <TextInput
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            error=""
          />
        )}
      </Field>
      <Subscribe>
        <div className="w-full inline-flex gap-4">
          <SecondaryButton
            type="submit"
            buttonText="Next"
            withIcon
            icon={IconArrowRight}
            onClick={() => {}}
            initialState="active"
          />
          <SecondaryButton
            type="button"
            buttonText="Clear"
            withIcon
            icon={IconTrash}
            onClick={() => reset(defaultData)}
            initialState="light"
          />
        </div>
      </Subscribe>
    </Form>
  );
}
