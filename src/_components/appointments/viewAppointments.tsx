import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useAuth } from '_context';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import { ViewAppointmentsFilterDto, ViewAppointmentDto } from '_types/dtos';
import { useState, useMemo } from 'react';
import AppLoader from '../misc/loader';
import { AppNotification } from '../misc';
import { AppointmentsTable } from '.';
import { AppNotification as AppNotificationType } from '_types/common';

export default function ViewAppointments({
  type,
  title,
}: {
  type: 'own' | 'hospital';
  title: string;
}) {
  const { accessToken } = useAuth();
  const [filter] = useState<ViewAppointmentsFilterDto | undefined>();

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

  return (
    <div>
      {isLoading && <AppLoader />}
      {error && !data && <AppNotification notification={error} />}
      {tableError && <AppNotification notification={tableError} />}
      {data && (
        <AppointmentsTable
          appointments={data}
          title={title}
          onError={(err) => setTableError(err)}
        />
      )}
    </div>
  );
}
