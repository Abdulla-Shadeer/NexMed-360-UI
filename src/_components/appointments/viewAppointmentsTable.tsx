import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import { ViewAppointmentDto } from '_types/dtos';
import { useMemo } from 'react';
import CustomTable from '@/components/table';
import AppointmentRowActions from './appointmentRowAction';
import { toDisplayDateTimeFormat } from '_utils/dateUtils';
import { AppNotificationType } from '_types/common';
import { getAppointmentStatusStyle } from '_utils/styleUtils';
import { startCase } from 'lodash';

export default function ViewAppointmentsTable({
  appointments,
  title,
  onError,
}: {
  appointments: ViewAppointmentDto[];
  title: string;
  onError: (error: AppNotificationType | undefined) => void;
}) {
  const columnHelper = createColumnHelper<ViewAppointmentDto>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('patientName', {
        cell: (info) => info.getValue(),
        header: 'Patient',
      }),
      columnHelper.accessor('doctorName', {
        cell: (info) => info.getValue(),
        header: 'Doctor',
      }),
      columnHelper.accessor('hospitalName', {
        cell: (info) => info.getValue(),
        header: 'Hospital',
      }),
      columnHelper.accessor('appointmentDateTime', {
        cell: (info) => (
          <p>{toDisplayDateTimeFormat(new Date(info.getValue()))}</p>
        ),
        header: 'Scheduled On',
      }),
      columnHelper.accessor('status', {
        cell: (info) => (
          <p className={getAppointmentStatusStyle(info.getValue())}>
            {startCase(info.getValue())}
          </p>
        ),
        header: 'Status',
      }),
      columnHelper.display({
        cell: (props) => (
          <AppointmentRowActions row={props.row} onError={onError} />
        ),
        header: 'Actions',
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper],
  );

  const table = useReactTable({
    columns: columns,
    data: appointments,
    getCoreRowModel: getCoreRowModel(),
  });

  return <CustomTable tableData={table} title={title} />;
}
