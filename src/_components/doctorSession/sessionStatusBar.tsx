import { API_PATHS } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '_context';
import { useEncounter } from '_context/_encounter/encounterContext';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import {
  FilterSessionsForCurrentDayDto,
  ViewCurrentOrNextSessionDto,
  ViewSessionHistoryDto,
  UpdateSessionHistoryDto,
  SessionStatusDto,
  AppNotificationType,
  ConfirmationDialogContext,
} from '@/types';
import { toDefaultDateFormat, to12HourFormat } from '_utils/dateUtils';
import { useEffect, useState } from 'react';
import { SecondaryButton } from '../buttons';
import { IconClock, IconXCircle } from '../icons/icons';
import AppLoader from '../misc/loader';
import EncounterStatusBar from './encounterStatusBar';
import ConfirmationDialog from '../popup/confirmationDialog';

export function DoctorSessionBar({
  doctorId,
  hospitalId,
  onError,
}: {
  doctorId: string;
  hospitalId: string;
  onError: (error?: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const filter = {
    date: toDefaultDateFormat(new Date()),
    doctorId,
    hospitalId,
  } as FilterSessionsForCurrentDayDto;
  const {
    data: hasAnySessionToday,
    error,
    isLoading,
  } = useAppQuery<boolean>({
    path: API_PATHS.getHasAnySessionToday,
    method: 'GET',
    accessToken,
    queryParams: filter,
  });

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="w-full">
      {isLoading && <AppLoader />}
      {hasAnySessionToday ? (
        <SessionStatus filter={filter} onError={onError} />
      ) : (
        <p>No Sessions available today</p>
      )}
    </div>
  );
}

function SessionStatus({
  filter,
  onError,
}: {
  filter: FilterSessionsForCurrentDayDto;
  onError: (error?: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const { isLoading: isLoading1, createQueryFunction } = useQueryFunction();
  const queryKey: ApiRequestOption = {
    path: API_PATHS.getCurrentOrUpcomingSession,
    method: 'GET',
    accessToken,
    queryParams: filter,
  };
  const { data, error, isLoading } =
    useAppQuery<ViewCurrentOrNextSessionDto>(queryKey);
  const [timeLeft, setTimeLeft] = useState<string | undefined>(undefined);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | undefined>(undefined);
  const queryClient = useQueryClient();
  const { tryContinueEncounter } = useEncounter();
  const [confirmationContext, setConfirmationContext] = useState<
    ConfirmationDialogContext | undefined
  >(undefined);

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (data?.isCurrent) {
      // remaining time calculation
      const [endHrString, endMntString] = data.endTime.split(':');
      const scheduledEndTime = new Date();
      scheduledEndTime.setHours(
        parseInt(endHrString, 10),
        parseInt(endMntString, 10),
        0,
      );

      const [startHrString, startMntString] = data.startedTime!.split(':');
      const startedTime = new Date();
      startedTime.setHours(
        parseInt(startHrString, 10),
        parseInt(startMntString, 10),
        0,
      );

      const intervalId = setInterval(() => {
        const differentInMillis =
          scheduledEndTime.getTime() - new Date().getTime();
        const minutes = (differentInMillis / 1000 / 60).toFixed(2);
        setTimeLeft(
          `${Math.floor(parseInt(minutes, 10) / 60)} Hours ${Math.ceil(parseInt(minutes, 10) % 60)} Minutes`,
        );
      }, 1000);
      setTimerId(intervalId);

      // try continue encounter if any
      if (data.lastKnownAppointmentId) {
        tryContinueEncounter(data.sessionId, data.lastKnownAppointmentId);
      }
    }

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.isCurrent]);

  function refetchCurrentOrNextSession() {
    queryClient.invalidateQueries({
      exact: true,
      queryKey: [queryKey],
    });
  }

  async function startSession(sessionId: string) {
    const start = createQueryFunction<ViewSessionHistoryDto>({
      path: API_PATHS.startDoctorSession(sessionId),
      method: 'GET',
      accessToken,
    });

    try {
      await start();
      // to refetch the current or next session
      refetchCurrentOrNextSession();
    } catch (error) {
      const err = error as Error;
      onError({
        type: 'error',
        title: 'Failed to start session!',
        description: err.message,
        cause: (err.cause as string) ?? undefined,
      });
    }
  }

  async function endOrCancelSession(sessionId: string, isCancel = false) {
    const body: UpdateSessionHistoryDto = {
      sessionId,
      date: toDefaultDateFormat(new Date()),
      sessionStatus: isCancel
        ? SessionStatusDto.Canceled
        : SessionStatusDto.Ended,
    };

    const update = createQueryFunction<ViewSessionHistoryDto>({
      path: API_PATHS.updateDoctorSessionHistory,
      method: 'POST',
      accessToken,
      payload: body,
    });

    try {
      await update();
      // to refetch the current or next session
      refetchCurrentOrNextSession();
    } catch (error) {
      const err = error as Error;
      onError({
        type: 'error',
        title: `Failed to ${isCancel ? 'cancel' : 'end'} session!`,
        description: err.message,
        cause: (err.cause as string) ?? undefined,
      });
    }
  }

  return (
    <div className="w-full">
      {(isLoading || isLoading1) && <AppLoader />}
      {confirmationContext && (
        <ConfirmationDialog
          isOpen={confirmationContext !== undefined}
          message={confirmationContext.message}
          onConfirm={confirmationContext.onConfirm}
          onClose={confirmationContext.onClose}
        />
      )}
      {data ? (
        <div
          className={`w-full bg-panel-light border-default border-border-primary ${data.isCurrent ? 'text-green-primary' : 'text-text-dark'} p-4 rounded-default mb-4 drop-shadow-default`}
        >
          <div className="w-full inline-flex justify-between items-center pb-2 mb-4 border-b-2 border-border-primary border-dashed">
            <p className="text-title text-blue-secondary">
              {data.isCurrent ? 'Ongoing ' : 'Upcoming '} Session Details
            </p>
            {data.isCurrent ? (
              <SecondaryButton
                buttonText="End Session"
                type="button"
                initialState="active"
                onClick={() =>
                  setConfirmationContext({
                    message:
                      'Please ensure that you have completed all encounters for this session',
                    onConfirm: () => {
                      setConfirmationContext(undefined);
                      endOrCancelSession(data.sessionId);
                    },
                    onClose: () => setConfirmationContext(undefined),
                  })
                }
              />
            ) : (
              <div className="inline-flex items-center gap-2">
                <SecondaryButton
                  buttonText="Start Session"
                  type="button"
                  initialState="active"
                  onClick={() =>
                    setConfirmationContext({
                      message: 'Are you sure want to start this session now?',
                      onConfirm: () => {
                        setConfirmationContext(undefined);
                        startSession(data.sessionId);
                      },
                      onClose: () => setConfirmationContext(undefined),
                    })
                  }
                  withIcon
                  icon={IconClock}
                />
                <SecondaryButton
                  buttonText="Cancel Session"
                  type="button"
                  initialState="light"
                  onClick={() =>
                    setConfirmationContext({
                      message:
                        'Are you sure want to Cancel this session for today?',
                      onConfirm: () => {
                        setConfirmationContext(undefined);
                        endOrCancelSession(data.sessionId, true);
                      },
                      onClose: () => setConfirmationContext(undefined),
                    })
                  }
                  withIcon
                  icon={IconXCircle}
                />
              </div>
            )}
          </div>

          <div className="w-full inline-flex flex-wrap justify-between items-center">
            <div className="lg:w-[30%] md:w-full sm:w-full space-y-2">
              <p>
                From:
                <span className="text-title-small ml-1 pb-1 border-b-2 border-border-primary border-dashed">
                  {to12HourFormat(data.startTime)}
                </span>
                {' To: '}
                <span className="text-title-small pb-1 border-b-2 border-border-primary border-dashed">
                  {to12HourFormat(data.endTime)}
                </span>
              </p>
              {data.isCurrent && (
                <>
                  <p>
                    Started At:
                    <span className="text-title-small ml-1 pb-1 border-b-2 border-border-primary border-dashed">
                      {to12HourFormat(data.startedTime!)}
                    </span>
                  </p>
                  <p>
                    Time Left:
                    <span className="text-title-small mx-1 pb-1 border-b-2 border-border-primary border-dashed">
                      {timeLeft ?? 'Calculating...'}
                    </span>
                  </p>
                  <p>
                    Patients Arrived:
                    <span className="text-title-small mx-1 pb-1 border-b-2 border-border-primary border-dashed">
                      {data.encountersCount}
                    </span>
                  </p>
                </>
              )}
            </div>

            {data.isCurrent && (
              <div className="lg:w-[70%] md:w-full sm:w-full lg:mt-0 md:mt-4 sm:mt-4">
                <EncounterStatusBar
                  onNotification={(notification) => onError(notification)}
                  doctorSessionId={data.sessionId}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="w-full p-4 bg-green-100 text-green-primary mb-4">
          All sessions are finished for today!
        </p>
      )}
    </div>
  );
}
