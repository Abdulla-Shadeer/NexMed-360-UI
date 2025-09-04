import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { CreateReceptionistDto } from '_types/dtos';
import { useState, useEffect } from 'react';
import { SecondaryButton } from '../buttons';
import { Form, TextInput } from '../form';
import { IconUserPlus, IconTrash } from '../icons/icons';
import { Divider } from '../misc';

export default function AddReceptionistForm({
  onFormSubmit,
}: {
  onFormSubmit: (data: CreateReceptionistDto) => void;
}) {
  const { user } = useAuth();
  const [defaultData] = useState<CreateReceptionistDto | undefined>(undefined);
  const { Field, Subscribe, reset, handleSubmit, setFieldValue } = useForm({
    defaultValues: defaultData,
    onSubmit: ({ value }) => {
      onFormSubmit(value);
    },
  });

  useEffect(() => {
    if (user) {
      setFieldValue('hospitalId', user.hospitalAdminProfile?.hospitalId ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Form action={handleSubmit}>
      <Field name="hospitalId">
        {(field) => {
          return (
            <TextInput
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
              required
              disabled
              error=""
            />
          );
        }}
      </Field>

      <Field
        name="personalInformation.firstName"
        validators={{
          onChange: (value) => (!value ? 'First name required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name="first name"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="personalInformation.lastName"
        validators={{
          onChange: (value) => (!value ? 'Last name required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name="last name"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="personalInformation.email"
        validators={{
          onChange: (value) => (!value ? 'Email required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            type="email"
            name="email"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field name="personalInformation.phoneNumber">
        {(field) => (
          <TextInput
            type="tel"
            name="phone number"
            value={field.state.value ?? ''}
            onChange={field.handleChange}
            error=""
          />
        )}
      </Field>

      <Field
        name="personalInformation.password"
        validators={{
          onChange: (value) => (!value ? 'Password required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            type="password"
            name="password"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Divider tw_width="w-full" />

      <Field
        name="department"
        validators={{
          onChange: (value) => (!value ? 'Department is required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name="department"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <Field
        name="location"
        validators={{
          onChange: (value) => (!value ? 'Location is required!' : undefined),
        }}
      >
        {(field) => (
          <TextInput
            name="location"
            value={field.state.value}
            onChange={field.handleChange}
            required
            error={field.state.meta.errorMap.onChange ?? ''}
          />
        )}
      </Field>

      <div className="w-full inline-flex gap-4">
        <Subscribe>
          <SecondaryButton
            initialState="active"
            type="submit"
            buttonText="Add Receptionist"
            withIcon
            icon={IconUserPlus}
            onClick={() => {}}
          />
          <SecondaryButton
            initialState="light"
            type="button"
            buttonText="Clear"
            withIcon
            icon={IconTrash}
            onClick={() => reset(defaultData)}
          />
        </Subscribe>
      </div>
    </Form>
  );
}
