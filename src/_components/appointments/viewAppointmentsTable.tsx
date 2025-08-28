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
import { toDefaultDateTimeFormat } from '_utils/dateUtils';

export default function ViewAppointmentsTable({
  appointments,
  title,
}: {
  appointments: ViewAppointmentDto[];
  title: string;
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
          <p>{toDefaultDateTimeFormat(new Date(info.getValue()))}</p>
        ),
        header: 'Scheduled On',
      }),
      columnHelper.accessor('status', {
        cell: (info) => (
          <p
            className={`py-1 px-2 rounded-default ${info.getValue() === ('Completed' as AppointmentStatus) ? 'bg-green-primary text-text-light' : info.getValue() === ('Pending' as AppointmentStatus) ? 'bg-amber-500 text-text-light' : ''}`}
          >
            {info.getValue()}
          </p>
        ),
        header: 'Status',
      }),
      columnHelper.display({
        cell: (props) => (
          <AppointmentRowActions row={props.row} returnPath={pathName} />
        ),
        header: 'Actions',
      }),
    ],
    [columnHelper, pathName],
  );

  const table = useReactTable({
    columns: columns,
    data: appointments,
    getCoreRowModel: getCoreRowModel(),
  });

  return <CustomTable tableData={table} title={title} />;
}
