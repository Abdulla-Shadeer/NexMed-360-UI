import { Row } from '@tanstack/react-table';
import { useAuth } from '_context';
import {
  AppointmentStatus,
  CancellationRequestDto,
  ViewAppointmentDto,
} from '_types/dtos';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import AppIcon from '../icons/appIcon';
import { IconMoreVertical } from '../icons/icons';
import { useQueryFunction } from '@/hooks';
import { apiPaths } from '@/constants';
import { AppNotification } from '_types/common';
import AppLoader from '../misc/loader';

export default function AppointmentRowActions({
  row,
  onError,
}: {
  row: Row<ViewAppointmentDto>;
  onError: (error: AppNotification | undefined) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();

  async function dispatchConfirmRequest(id: string) {
    const request = createQueryFunction<ViewAppointmentDto>({
      path: apiPaths.confirmAppointment(id),
      method: 'GET',
      accessToken,
    });

    try {
      onError(undefined);
      await request();
      onError({
        type: 'success',
        title: 'Appointment Confirmed!',
        description: 'It may take up to 5 minutes to reflect the changes.',
      });
    } catch (error) {
      const err = error as Error;
      onError({
        type: 'error',
        title: 'Failed to confirm Appointment!',
        description: err.message,
        cause: (err.cause as string) ?? '',
      });
    }
  }

  async function dispatchCancelRequest(id: string, reason: string) {
    const cancelReq: CancellationRequestDto = {
      appointmentId: id,
      reason,
    };
    const request = createQueryFunction<ViewAppointmentDto>({
      path: apiPaths.cancelAppointment,
      method: 'POST',
      accessToken,
      payload: cancelReq,
    });

    try {
      onError(undefined);
      const res = await request();
      onError({
        type: 'success',
        title: 'Success!',
        description: 'It may take up to 5 minutes to reflect the changes.',
        cause: res.data?.status,
      });
    } catch (error) {
      const err = error as Error;
      onError({
        type: 'error',
        title: 'Failed to cancel Appointment!',
        description: err.message,
        cause: (err.cause as string) ?? '',
      });
    }
  }

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
      {isLoading && <AppLoader />}
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
            href={`/appointments/view/${row.original.id}`}
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
                  href={`/appointments/edit/${row.original.id}`}
                  className="hover:text-blue-secondary"
                >
                  Edit
                </Link>
              )}

              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  dispatchConfirmRequest(row.original.id);
                }}
              >
                Confirm
              </a>

              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const reason = window.prompt('Why do you want to cancle?');
                  if (reason) {
                    dispatchCancelRequest(row.original.id, reason);
                  }
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
