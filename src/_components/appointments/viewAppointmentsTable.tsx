import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import { AppointmentStatusDto, ViewAppointmentDto } from '_types/dtos';
import { useMemo } from 'react';
import CustomTable from '@/components/table';
import AppointmentRowActions from './appointmentRowAction';
import { toDisplayDateTimeFormat } from '_utils/dateUtils';
import { AppNotification } from '_types/common';

export default function ViewAppointmentsTable({
  appointments,
  title,
  onError,
}: {
  appointments: ViewAppointmentDto[];
  title: string;
  onError: (error: AppNotification | undefined) => void;
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
          <p
            className={`py-1 px-2 rounded-default ${info.getValue() === AppointmentStatusDto.Completed ? 'bg-green-primary text-text-light dark:text-text-light' : info.getValue() === AppointmentStatusDto.Pending ? 'bg-amber-300 text-text-dark dark:text-background' : info.getValue() === AppointmentStatusDto.Cancelled ? 'bg-amber-700 text-text-light' : info.getValue() === AppointmentStatusDto.Confirmed ? 'bg-green-200 text-text-dark' : info.getValue() === AppointmentStatusDto.CancelRequested ? 'bg-amber-500 text-text-light' : ''}`}
          >
            {info.getValue()}
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
