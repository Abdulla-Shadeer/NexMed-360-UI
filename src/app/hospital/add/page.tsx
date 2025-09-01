'use client';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput } from '@/components/form';
import { IconArrowRight, IconSend, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import {
  CreateHospitalAdminDto,
  CreateHospitalDto,
  RegisterUserDto,
  ViewHospitalDto,
  ViewUserDto,
  AppNotification as AppNotificationType,
} from '@/types';
import { useState } from 'react';

const stepButtonStyle =
  'text-default text-left py-1 px-2 border-border-primary border-default cursor-pointer';

export default function AddHospital() {
  const [step, setStep] = useState<'one' | 'two'>('one');
  const [defaultHospitalData, setDefaultHospitalData] = useState<
    CreateHospitalDto | undefined
  >(undefined);
  const [defaultAdminData, setDefaultAdminData] = useState<
    RegisterUserDto | undefined
  >(undefined);
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const [createdHospitalId, setCreatedHospitalId] = useState<
    string | undefined
  >(undefined);

  async function dispatchCreateHospital(data: CreateHospitalDto) {
    const request = createQueryFunction<ViewHospitalDto>({
      path: apiPaths.addHospital,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const response = await request();
      setCreatedHospitalId(response.data?.id);
      setDefaultHospitalData(undefined);
      setStep('two');
      setNotification({
        type: 'success',
        title: 'Hospital Added Successfully!',
        description: `Hospital ID: ${response.data?.id}`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Failed to create Hospital!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  async function dispatchAssignAdmin(data: RegisterUserDto) {
    const addAdminDto: CreateHospitalAdminDto = {
      hospitalId: createdHospitalId ?? '',
      personalInformation: data,
    };
    const request = createQueryFunction<ViewUserDto>({
      path: apiPaths.assignHospitalAdmin,
      method: 'POST',
      accessToken,
      payload: addAdminDto,
    });

    try {
      setNotification(undefined);
      const response = await request();
      setCreatedHospitalId(undefined);
      setDefaultHospitalData(undefined);
      setDefaultAdminData(undefined);
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
        <HospitalInfo
          defaultData={defaultHospitalData}
          submitCallback={(data) => {
            setDefaultHospitalData(data);
            dispatchCreateHospital(data);
          }}
        />
      )}

      {step === 'two' && (
        <HospitalAdminInfo
          defaultData={defaultAdminData}
          submitCallback={(data) => {
            setDefaultAdminData(data);
            dispatchAssignAdmin(data);
          }}
          hospitalId={createdHospitalId}
        />
      )}
    </div>
  );
}

function HospitalInfo({
  submitCallback,
  defaultData,
}: {
  submitCallback: (data: CreateHospitalDto) => void;
  defaultData: CreateHospitalDto | undefined;
}) {
  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => submitCallback(value),
  });

  return (
    <Form title="Hospital Info" action={handleSubmit}>
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

function HospitalAdminInfo({
  submitCallback,
  defaultData,
  hospitalId,
}: {
  submitCallback: (data: RegisterUserDto) => void;
  defaultData: RegisterUserDto | undefined;
  hospitalId?: string;
}) {
  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => submitCallback(value),
  });

  return (
    <Form title="Hospital Admin Info" action={handleSubmit}>
      <TextInput
        name="Hospital ID"
        value={hospitalId ?? ''}
        onChange={() => {}}
        required
        error=""
        disabled
      />
      <Field
        name="firstName"
        validators={{
          onChange: ({ value }) =>
            !value ? 'First Name required!' : undefined,
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
        name="lastName"
        validators={{
          onChange: ({ value }) => (!value ? 'Last Name required!' : undefined),
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
        name="email"
        validators={{
          onChange: ({ value }) => (!value ? 'Email required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            type="email"
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
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
            onChange={field.handleChange}
            error=""
          />
        )}
      </Field>

      <Field
        name="password"
        validators={{
          onChange: ({ value }) => (!value ? 'Password required!' : undefined),
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

      <Subscribe>
        <div className="w-full inline-flex gap-4">
          <SecondaryButton
            type="submit"
            buttonText="Submit"
            withIcon
            icon={IconSend}
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
