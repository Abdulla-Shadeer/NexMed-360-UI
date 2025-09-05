'use client';

import { useForm } from '@tanstack/react-form';
import {
  CreatePatientDto,
  CreateDoctorDto,
  CreateReceptionistDto,
  CreateHospitalAdminDto,
} from '@/types';
import { startCase } from 'lodash';
import { useState, useEffect } from 'react';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput, RadioInput, DateInput } from '@/components/form';
import { IconUserPlus, IconTrash } from '@/components/icons/icons';
import HospitalSelecter from './hospitalSelector';
import { Divider } from '@/components/misc';

interface UserFormData {
  hospitalId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  speciality?: string;
  location?: string;
  department?: string;
  gender?: 'Male' | 'Female';
  birthDate?: string;
}

export default function AddUserForm({
  userType,
  onFormSubmit,
  hospitalId,
}: {
  userType: 'doctor' | 'receptionist' | 'hospitalAdmin' | 'patient';
  onFormSubmit: (
    data:
      | CreatePatientDto
      | CreateDoctorDto
      | CreateHospitalAdminDto
      | CreateReceptionistDto,
  ) => void;
  hospitalId?: string;
}) {
  const [defaultFormData, setDefaultFormData] = useState<
    UserFormData | undefined
  >(undefined);

  function convertAndSubmit(formData: UserFormData) {
    switch (userType) {
      case 'patient':
        const createPatientDto: CreatePatientDto = {
          personalInformation: {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phoneNumber: formData.phoneNumber,
            password: formData.password!,
          },
          gender: formData.gender ?? 'Male',
          birthDate: formData.birthDate ?? '',
        };
        onFormSubmit(createPatientDto);
        break;
      case 'doctor':
        const createDoctorDto: CreateDoctorDto = {
          hospitalId: formData.hospitalId ?? '',
          personalInformation: {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phoneNumber: formData.phoneNumber,
            password: formData.password!,
          },
          speciality: formData.speciality ?? '',
        };
        onFormSubmit(createDoctorDto);
        break;
      case 'receptionist':
        const createReceptionistDto: CreateReceptionistDto = {
          hospitalId: formData.hospitalId ?? '',
          personalInformation: {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phoneNumber: formData.phoneNumber,
            password: formData.password!,
          },
          department: formData.department ?? '',
          location: formData.location ?? '',
        };
        onFormSubmit(createReceptionistDto);
        break;
      case 'hospitalAdmin':
        const createAdminDto: CreateHospitalAdminDto = {
          hospitalId: formData.hospitalId ?? '',
          personalInformation: {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phoneNumber: formData.phoneNumber,
            password: formData.password!,
          },
        };
        onFormSubmit(createAdminDto);
        break;
    }
  }

  const { Field, Subscribe, reset, handleSubmit, getFieldValue } = useForm({
    defaultValues: defaultFormData,
    onSubmit: ({ value }) => convertAndSubmit(value),
  });

  useEffect(() => {
    if (hospitalId) {
      setDefaultFormData({ hospitalId: hospitalId });
    }
  }, [hospitalId]);

  return (
    <Form action={handleSubmit} title={`Add ${startCase(userType)}`}>
      {userType !== 'patient' && (
        <Field
          name="hospitalId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Hospital ID is required!' : undefined,
          }}
        >
          {(field) =>
            hospitalId ? (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                onChange={field.handleChange}
                required
                disabled
                error={field.state.meta.errorMap.onChange ?? ''}
              />
            ) : (
              <HospitalSelecter
                onChange={field.handleChange}
                fieldError={field.state.meta.errorMap.onChange ?? ''}
                selected={undefined}
              />
            )
          }
        </Field>
      )}

      <Field
        name="firstName"
        validators={{
          onChange: ({ value }) =>
            !value ? 'First name required!' : undefined,
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
          onChange: ({ value }) => (!value ? 'Last name required!' : undefined),
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
            type="password"
            name="password"
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="confirmPassword"
        validators={{
          onChangeListenTo: ['password'],
          onChange: ({ value }) =>
            !value
              ? 'Please confirm password!'
              : value !== getFieldValue('password')
                ? 'Passwords do not match!'
                : undefined,
        }}
      >
        {(field) => (
          <TextInput
            type="password"
            name={field.name}
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Divider tw_width="w-full" />

      {userType === 'patient' ? (
        <>
          <Field
            name="gender"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Gender is required!' : undefined,
            }}
          >
            {(field) => (
              <RadioInput
                name={field.name}
                selectItems={['Male', 'Female']}
                selectedItem={field.state.value ?? ''}
                onChange={(value) =>
                  field.handleChange(value as 'Male' | 'Female')
                }
                required
                error={field.state.meta.errorMap.onChange ?? ''}
              />
            )}
          </Field>

          <Field
            name="birthDate"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Birth date is required!' : undefined,
            }}
          >
            {(field) => (
              <DateInput
                name={field.name}
                pickedDate={field.state.value ?? ''}
                onPick={field.handleChange}
                required
                error={field.state.meta.errorMap.onChange ?? ''}
              />
            )}
          </Field>
        </>
      ) : userType === 'doctor' ? (
        <Field
          name="speciality"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Speciality required!' : undefined,
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
      ) : userType === 'receptionist' ? (
        <>
          <Field
            name="department"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Department required!' : undefined,
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
            name="location"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Location required!' : undefined,
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
        </>
      ) : (
        <></>
      )}

      <div className="w-full flex flex-row gap-4">
        <Subscribe>
          <SecondaryButton
            initialState="active"
            buttonText={`Create ${startCase(userType)}`}
            withIcon
            icon={IconUserPlus}
            onClick={() => {}}
            type="submit"
          />

          <SecondaryButton
            initialState="light"
            buttonText="Clear"
            withIcon
            icon={IconTrash}
            onClick={() => reset(defaultFormData)}
            type="button"
          />
        </Subscribe>
      </div>
    </Form>
  );
}
