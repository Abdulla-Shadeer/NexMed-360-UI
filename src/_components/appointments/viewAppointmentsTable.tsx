import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import { AppointmentStatus, ViewAppointmentDto } from '_types/dtos';
import { useMemo } from 'react';
import CustomTable from '@/components/table';
import AppointmentRowActions from './appointmentRowAction';
import { usePathname } from 'next/navigation';
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
  const pathName = usePathname();

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
            className={`py-1 px-2 rounded-default ${info.getValue() === ('Completed' as AppointmentStatus) ? 'bg-green-primary text-text-light dark:text-text-light' : info.getValue() === ('Pending' as AppointmentStatus) ? 'bg-amber-300 text-text-dark dark:text-background' : info.getValue() === ('Cancelled' as AppointmentStatus) ? 'bg-amber-700 text-text-light' : info.getValue() === ('Confirmed' as AppointmentStatus) ? 'bg-green-200 text-text-dark' : info.getValue() === ('CancelRequested' as AppointmentStatus) ? 'bg-amber-500 text-text-light' : ''}`}
          >
            {info.getValue()}
          </p>
        ),
        header: 'Status',
      }),
      columnHelper.display({
        cell: (props) => (
          <AppointmentRowActions
            row={props.row}
            returnPath={pathName}
            onError={onError}
          />
        ),
        header: 'Actions',
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, pathName],
  );

  const table = useReactTable({
    columns: columns,
    data: appointments,
    getCoreRowModel: getCoreRowModel(),
  });

  return <CustomTable tableData={table} title={title} />;
}
