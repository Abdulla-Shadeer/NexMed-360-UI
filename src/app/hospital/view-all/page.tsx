'use client';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import CustomTable from '@/components/table';
import { apiPaths, userRoles } from '@/constants';
import { useAppQuery } from '@/hooks';
import {
  createColumnHelper,
  getCoreRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { useAuth } from '_context';
import { ViewHospitalDto } from '@/types';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '@/components/icons/appIcon';
import { IconMoreVertical } from '@/components/icons/icons';

export default function ViewAllHospitals() {
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto[]>({
    path: apiPaths.getAllHospitals,
    method: 'GET',
    accessToken,
  });
  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {data && <HospitalTable hospitals={data} />}
    </div>
  );
}

function HospitalTable({ hospitals }: { hospitals: ViewHospitalDto[] }) {
  const columnHelper = createColumnHelper<ViewHospitalDto>();
  const { user } = useAuth();
  const [showClipboardNote, setShowClipboardNote] = useState(false);

  function renderHospitalRowActions(row: Row<ViewHospitalDto>) {
    return (
      <TableRowActions>
        <>
          <Link
            href={`/hospital/view/${row.original.id}`}
            className="text-default text-blue-secondary hover:text-blue-primary"
          >
            View
          </Link>

          <Link
            href={`/hospital/edit/${row.original.id}`}
            className="text-default text-blue-secondary hover:text-blue-primary"
          >
            Edit
          </Link>

          {user?.roles.some((role) => role === userRoles.superUser) && (
            <Link
              href={`/hospital/assign-admin?id=${row.original.id}`}
              className="text-default text-blue-secondary hover:text-blue-primary"
            >
              Assign Admin
            </Link>
          )}

          <button
            className="w-fit text-default text-left text-blue-secondary hover:text-blue-primary p-0 pb-1 border-b-2 border-border-primary border-dashed cursor-pointer"
            onClick={() => {
              window.navigator.clipboard.writeText(row.original.id);
              setShowClipboardNote(true);
              setTimeout(() => {
                setShowClipboardNote(false);
              }, 2000);
            }}
          >
            Copy ID
          </button>
        </>
      </TableRowActions>
    );
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: '#',
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        cell: (props) => {
          const row = props.row.original;
          return <p>{`${row.street}, ${row.city}, ${row.district}`}</p>;
        },
        header: 'Address',
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        header: 'Actions',
        cell: (info) => renderHospitalRowActions(info.row),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: hospitals,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      {showClipboardNote && (
        <p className="text-default text-green-primary fixed bottom-4 right-4 p-2 bg-panel-light border-default border-border-primary rounded-default">
          Copied to clipboard!
        </p>
      )}
      <CustomTable tableData={table} title="Hospitals" />
    </div>
  );
}

function TableRowActions({ children }: { children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMousedownEvent(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleMousedownEvent);
    }

    return () => {
      document.removeEventListener('mousedown', handleMousedownEvent);
    };
  }, [showMenu]);

  return (
    <>
      <a
        onClick={() => {
          setShowMenu((prev) => !prev);
        }}
      >
        <AppIcon icon={IconMoreVertical} tw="hover:cursor-pointer" />
      </a>
      {showMenu && (
        <div
          className="w-fit p-4 flex flex-col gap-2 bg-panel-light border-default border-border-primary rounded-default drop-shadow-default absolute"
          ref={menuRef}
        >
          {children}
        </div>
      )}
    </>
  );
}
