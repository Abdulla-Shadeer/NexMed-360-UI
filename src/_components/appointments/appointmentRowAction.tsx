import { Row } from '@tanstack/react-table';
import { useAuth } from '_context';
import { AppointmentStatus, ViewAppointmentDto } from '_types/dtos';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import AppIcon from '../icons/appIcon';
import { IconMoreVertical } from '../icons/icons';

export default function AppointmentRowActions({
  row,
  returnPath,
}: {
  row: Row<ViewAppointmentDto>;
  returnPath: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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
        onClick={(e) => {
          e.preventDefault();
          setShowMenu((prev) => !prev);
        }}
      >
        <AppIcon icon={IconMoreVertical} tw="hover:cursor-pointer" />
      </a>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute w-fit h-fit p-4 flex flex-col gap-1 bg-panel-light border-default border-border-primary rounded-default drop-shadow-default"
        >
          <Link
            href={`/appointments/view/${row.original.id}?returnPath=${returnPath}`}
            className="hover:text-blue-secondary"
          >
            View
          </Link>
          {!(
            row.original.status.toLowerCase() === AppointmentStatus.Completed ||
            row.original.status.toLowerCase() === AppointmentStatus.Cancelled
          ) && (
            <>
              {user?.id === row.original.createdByUserId && (
                <Link
                  href={`/appointments/edit/${row.original.id}?returnPath=${returnPath}`}
                  className="hover:text-blue-secondary"
                >
                  Edit
                </Link>
              )}

              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  // call confirm request here
                }}
              >
                Confirm
              </a>

              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  // call cancel request here
                }}
              >
                Cancel
              </a>
            </>
          )}
        </div>
      )}
    </>
  );
}
