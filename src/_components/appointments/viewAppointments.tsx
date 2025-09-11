import { apiPaths, userRoles } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import {
  ViewAppointmentsFilterDto,
  ViewAppointmentDto,
  AppointmentStatusDto,
} from '_types/dtos';
import { useState, useMemo, useEffect } from 'react';
import AppLoader from '../misc/loader';
import { AppNotification, EntitySearch } from '../misc';
import { AppointmentsTable } from '.';
import { AppNotification as AppNotificationType } from '_types/common';
import { useForm } from '@tanstack/react-form';
import { DateInput, Form, SelectInput, TextInput } from '../form';
import { SecondaryButton } from '../buttons';
import { IconFilter, IconTrash } from '../icons/icons';

export default function ViewAppointments({
  type,
  title,
}: {
  type: 'own' | 'hospital';
  title: string;
}) {
  const { accessToken, user } = useAuth();
  const [filter, setFilter] = useState<ViewAppointmentsFilterDto>({});

  const requestOptions = useMemo(() => {
    const opt: ApiRequestOption = {
      path:
        type === 'own'
          ? apiPaths.viewOwnAppointments
          : apiPaths.viewHospitalAppointments,
      method: 'GET',
      queryParams: filter,
      accessToken,
    };
    return opt;
  }, [filter, accessToken, type]);

  const { isLoading, data, error } =
    useAppQuery<ViewAppointmentDto[]>(requestOptions);
  const [tableError, setTableError] = useState<AppNotificationType | undefined>(
    undefined,
  );

  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: filter || {},
    onSubmit: ({ value }) => {
      setFilter(value);
    },
  });

  useEffect(() => {
    if (error) {
      setFilter({});
      reset({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  function AppointmentFilter() {
    return (
      <Form title="Filter Appointments" action={handleSubmit}>
        {(type === 'hospital' || user?.roles.includes(userRoles.doctor)) && (
          <Field name="patientId">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(value) => field.handleChange(value)}
                error=""
                tw_width="w-fit"
              />
            )}
          </Field>
        )}

        {(type === 'hospital' || user?.roles.includes(userRoles.patient)) && (
          <Field name="doctorId">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(value) => field.handleChange(value)}
                error=""
                tw_width="w-fit"
              />
            )}
          </Field>
        )}

        {type === 'own' && (
          <Field name="hospitalId">
            {(field) => (
              <TextInput
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(value) => field.handleChange(value)}
                error=""
                tw_width="w-fit"
              />
            )}
          </Field>
        )}

        <Field name="status">
          {(field) => (
            <SelectInput
              name={field.name}
              options={Object.entries(AppointmentStatusDto).flatMap(
                (e) => e[1],
              )}
              selected={field.state.value}
              onSelect={(value) =>
                field.handleChange(value as AppointmentStatusDto)
              }
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>

        <Field name="fromDate">
          {(field) => (
            <DateInput
              name={field.name}
              pickedDate={field.state.value}
              onPick={(value) => field.handleChange(value)}
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>

        <Field name="toDate">
          {(field) => (
            <DateInput
              name={field.name}
              pickedDate={field.state.value}
              onPick={(value) => field.handleChange(value)}
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>

        <Subscribe>
          <SecondaryButton
            type="submit"
            buttonText="Apply"
            onClick={() => {}}
            withIcon
            icon={IconFilter}
            initialState="active"
          />
          <SecondaryButton
            type="button"
            buttonText="Clear"
            onClick={() => {
              setFilter({});
              reset({});
            }}
            withIcon
            icon={IconTrash}
            initialState="light"
          />
        </Subscribe>
      </Form>
    );
  }

  return (
    <div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {tableError && <AppNotification notification={tableError} />}
      {data && (
        <div>
          <EntitySearch open={false} />
          <AppointmentFilter />
          <AppointmentsTable
            appointments={data}
            title={title}
            onError={(err) => setTableError(err)}
          />
        </div>
      )}
    </div>
  );
}
