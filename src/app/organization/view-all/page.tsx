'use client';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import CustomTable from '@/components/table';
import { API_PATHS, USER_ROLES } from '@/constants';
import { useAppQuery } from '@/hooks';
import {
  createColumnHelper,
  getCoreRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { useAuth } from '_context';
import { ViewOrganizationDto } from '@/types';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '@/components/icons/appIcon';
import { IconMoreVertical } from '@/components/icons/icons';
import RefreshData from '@/components/misc/refresh';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';

export default function ViewAllOrganizations() {
  const { accessToken } = useAuth();
  const queryKey: ApiRequestOption = {
    path: API_PATHS.getAllOrganizations,
    method: 'GET',
    accessToken,
  };
  const { data, error, isLoading } =
    useAppQuery<ViewOrganizationDto[]>(queryKey);
  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {data && <RefreshData queryKey={queryKey} />}
      {data && <OrganizationTable organizations={data} />}
    </div>
  );
}

function OrganizationTable({
  organizations,
}: {
  organizations: ViewOrganizationDto[];
}) {
  const columnHelper = createColumnHelper<ViewOrganizationDto>();
  const { user } = useAuth();
  const [showClipboardNote, setShowClipboardNote] = useState(false);

  function renderOrganizationRowActions(row: Row<ViewOrganizationDto>) {
    return (
      <TableRowActions>
        <>
          <Link
            href={`/organization/view/${row.original.id}`}
            className="text-default text-blue-secondary hover:text-blue-primary"
          >
            View
          </Link>

          {user?.roles.some(
            (role) =>
              role === USER_ROLES.platformAdmin ||
              role === USER_ROLES.organizationManager,
          ) && (
            <Link
              href={`/organization/edit/${row.original.id}`}
              className="text-default text-blue-secondary hover:text-blue-primary"
            >
              Edit
            </Link>
          )}

          {user?.roles.some((role) => role === USER_ROLES.platformAdmin) && (
            <Link
              href={`/organization/assign-admin?id=${row.original.id}`}
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
        cell: (info) => renderOrganizationRowActions(info.row),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: organizations,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      {showClipboardNote && (
        <p className="text-default text-green-primary fixed bottom-4 right-4 p-2 bg-panel-light border-default border-border-primary rounded-default">
          Copied to clipboard!
        </p>
      )}
      <CustomTable tableData={table} title="Organizations" />
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
