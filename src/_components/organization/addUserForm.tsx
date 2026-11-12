'use client';

import { useForm } from '@tanstack/react-form';
import {
  CreatePatientDto,
  CreatePractitionerRoleDto,
  CreateOrganizationMemberDto,
  CreateOrganizationManagerDto,
} from '@/types';
import { startCase } from 'lodash';
import { useState, useEffect, useRef } from 'react';
import { SecondaryButton } from '@/components/buttons';
import { Form, TextInput, RadioInput, DateInput } from '@/components/input';
import { IconUserPlus, IconTrash } from '@/components/icons/icons';
import OrganizationSelecter from './organizationSelector';
import { Divider } from '@/components/misc';

interface UserFormData {
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  roleName?: string;
  specialty?: string;
  gender?: 'Male' | 'Female';
  birthDate?: string;
}

export default function AddUserForm({
  userType,
  onFormSubmit,
  organizationId,
  onClear,
}: {
  userType:
    | 'practitionerRole'
    | 'organizationMember'
    | 'organizationManager'
    | 'patient';
  onFormSubmit: (
    data:
      | CreatePatientDto
      | CreatePractitionerRoleDto
      | CreateOrganizationManagerDto
      | CreateOrganizationMemberDto,
  ) => Promise<boolean>;
  organizationId?: string;
  onClear?: () => void;
}) {
  const [defaultFormData, setDefaultFormData] = useState<UserFormData>({
    organizationId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = useRef(false);

  async function convertAndSubmit(formData: UserFormData) {
    if (pending.current) return;
    pending.current = true;
    setIsSubmitting(true);
    try {
      let success = false;
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
          success = await onFormSubmit(createPatientDto);
          break;
        case 'practitionerRole':
          const createPractitionerRoleDto: CreatePractitionerRoleDto = {
            organizationId: formData.organizationId ?? '',
            personalInformation: {
              firstName: formData.firstName!,
              lastName: formData.lastName!,
              email: formData.email!,
              phoneNumber: formData.phoneNumber,
              password: formData.password!,
            },
            roleName: formData.roleName?.trim() || 'Practitioner',
            specialty: formData.specialty ?? '',
          };
          success = await onFormSubmit(createPractitionerRoleDto);
          break;
        case 'organizationMember':
          const createOrganizationMemberDto: CreateOrganizationMemberDto = {
            organizationId: formData.organizationId ?? '',
            personalInformation: {
              firstName: formData.firstName!,
              lastName: formData.lastName!,
              email: formData.email!,
              phoneNumber: formData.phoneNumber,
              password: formData.password!,
            },
          };
          success = await onFormSubmit(createOrganizationMemberDto);
          break;
        case 'organizationManager':
          const createAdminDto: CreateOrganizationManagerDto = {
            organizationId: formData.organizationId ?? '',
            personalInformation: {
              firstName: formData.firstName!,
              lastName: formData.lastName!,
              email: formData.email!,
              phoneNumber: formData.phoneNumber,
              password: formData.password!,
            },
          };
          success = await onFormSubmit(createAdminDto);
          break;
      }
      if (success) {
        reset({ organizationId: formData.organizationId ?? organizationId });
        onClear?.();
      }
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }

  const { Field, Subscribe, reset, handleSubmit, getFieldValue } = useForm({
    defaultValues: defaultFormData,
    onSubmit: ({ value }) => convertAndSubmit(value),
  });

  useEffect(() => {
    if (organizationId) {
      setDefaultFormData({ organizationId: organizationId });
    }
  }, [organizationId]);

  return (
    <fieldset disabled={isSubmitting} className="w-full">
      <Form
        action={handleSubmit}
        title={
          userType === 'organizationMember'
            ? 'Add Member'
            : userType === 'practitionerRole'
              ? 'Add Practitioner Assignment'
              : `Add ${startCase(userType)}`
        }
      >
        {userType !== 'patient' && (
          <Field
            name="organizationId"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Organization ID is required!' : undefined,
            }}
          >
            {(field) =>
              organizationId ? (
                <TextInput
                  name={field.name}
                  value={field.state.value ?? ''}
                  onChange={field.handleChange}
                  required
                  disabled
                  error={field.state.meta.errorMap.onChange ?? ''}
                />
              ) : (
                <OrganizationSelecter
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
            onChange: ({ value }) =>
              !value ? 'Last name required!' : undefined,
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
            onChange: ({ value }) =>
              !value ? 'Password required!' : undefined,
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
        ) : userType === 'practitionerRole' ? (
          <>
            <Field name="roleName">
              {(field) => (
                <TextInput
                  name="Professional role"
                  description="For example, Nurse, Radiologist, or Care assistant"
                  value={field.state.value ?? ''}
                  onChange={field.handleChange}
                  error=""
                />
              )}
            </Field>
            <Field name="specialty">
              {(field) => (
                <TextInput
                  name={field.name}
                  value={field.state.value ?? ''}
                  onChange={field.handleChange}
                  error=""
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
              buttonText={
                userType === 'organizationMember'
                  ? 'Create Member'
                  : userType === 'practitionerRole'
                    ? 'Create Practitioner Assignment'
                    : `Create ${startCase(userType)}`
              }
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
              onClick={() => {
                reset(defaultFormData);
                onClear?.();
              }}
              type="button"
            />
          </Subscribe>
        </div>
      </Form>
    </fieldset>
  );
}
