import { Row } from '@tanstack/react-table';
import { useAuth } from '_context';
import {
  AppointmentStatusDto,
  CancellationRequestDto,
  ViewAppointmentDto,
} from '_types/dtos';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import AppIcon from '../icons/appIcon';
import { IconMoreVertical } from '../icons/icons';
import { useQueryFunction } from '@/hooks';
import { API_PATHS } from '@/constants';
import { AppNotificationType, ConfirmationDialogContext } from '_types/common';
import AppLoader from '../misc/loader';
import ConfirmationDialog from '../popup/confirmationDialog';

export default function AppointmentRowActions({
  row,
  onError,
}: {
  row: Row<ViewAppointmentDto>;
  onError: (error: AppNotificationType | undefined) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [confirmationContext, setConfirmationContext] = useState<
    ConfirmationDialogContext | undefined
  >(undefined);

  async function dispatchConfirmRequest(id: string) {
    const request = createQueryFunction<ViewAppointmentDto>({
      path: API_PATHS.confirmAppointment(id),
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
      path: API_PATHS.cancelAppointment,
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
      {confirmationContext && (
        <ConfirmationDialog
          isOpen={confirmationContext !== undefined}
          message={confirmationContext.message}
          withPrompt={confirmationContext.withPrompt || false}
          promptName={confirmationContext.promptName || 'Enter a value'}
          promptRequired={confirmationContext.promptRequired || false}
          onConfirm={(prompt) => confirmationContext.onConfirm(prompt)}
          onClose={confirmationContext.onClose}
          yesText={confirmationContext.yesText ?? 'Yes'}
          noText={confirmationContext.noText ?? 'No'}
        />
      )}
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
            href={`/appointments/view/${row.original.bookingReference}`}
            className="hover:text-blue-secondary"
          >
            View
          </Link>
          {!(
            row.original.status === AppointmentStatusDto.Completed ||
            row.original.status === AppointmentStatusDto.Cancelled ||
            row.original.status === AppointmentStatusDto.Confirmed ||
            row.original.status === AppointmentStatusDto.Arrived ||
            row.original.status === AppointmentStatusDto.InProgress
          ) && (
            <>
              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmationContext({
                    message: 'Are sure to confirm this appointment?',
                    onConfirm: () => {
                      setConfirmationContext(undefined);
                      dispatchConfirmRequest(row.original.bookingReference);
                    },
                    onClose: () => setConfirmationContext(undefined),
                  });
                }}
              >
                Confirm
              </a>

              <a
                className="hover:cursor-pointer hover:text-blue-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmationContext({
                    message: 'Why do you want to cancel this appointment?',
                    withPrompt: true,
                    promptName: 'Reason',
                    promptRequired: true,
                    onConfirm: (prompt) => {
                      setConfirmationContext(undefined);
                      dispatchCancelRequest(
                        row.original.bookingReference,
                        prompt || 'undefined',
                      );
                    },
                    onClose: () => setConfirmationContext(undefined),
                    yesText: 'Cancel',
                    noText: 'Close',
                  });
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
