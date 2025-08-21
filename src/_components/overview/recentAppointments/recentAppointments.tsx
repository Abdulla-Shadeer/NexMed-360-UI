import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import { ViewAppointmentDto } from '_types/dtos';
import { useMemo } from 'react';
import CustomTable from '@/components/table';
import AppointmentRowActions from './appointmentRowAction';
import { usePathname } from 'next/navigation';

export default function RecentAppointments({
  appointments,
}: {
  appointments: ViewAppointmentDto[];
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
        cell: (info) => info.getValue(),
        header: 'Scheduled On',
      }),
      columnHelper.accessor('status', {
        cell: (info) => info.getValue(),
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

  return <CustomTable tableData={table} title="Recent Appointments" />;
}
