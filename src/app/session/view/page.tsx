'use client';
import { useWorkspace } from '_context/_workspace/workspaceContext';
import QuickActionButton from '@/components/buttons/quickActionButton';
import UpdatePractitionerScheduleForm from '@/components/practitionerSchedule/updatePractitionerSchedule';
import AppIcon from '@/components/icons/appIcon';
import {
  IconCheckCircle,
  IconClock,
  IconEdit,
  IconPlayCircle,
  IconStopCircle,
  IconTrash,
  IconXCircle,
} from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import ConfirmationDialog from '@/components/popup/confirmationDialog';
import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '_context';
import useQueryFunction, {
  ApiRequestOption,
} from '_hooks/_api/useQueryFunction';
import {
  AppNotificationType,
  ConfirmationDialogContext,
  FilterPractitionerScheduleDto,
  UpdatePractitionerScheduleDto,
  ViewPractitionerScheduleDto,
} from '@/types';
import { to12HourFormat } from '_utils/dateUtils';
import { toNumber } from 'lodash';
import { useState } from 'react';

enum CurrentWindow {
  ViewWindow,
  EditWindow,
}

export default function ViewSessionsPage() {
  const { accessToken } = useUser();
  const { workspace } = useWorkspace();
  const queryKey: ApiRequestOption = {
    path: API_PATHS.getPractitionerSchedules,
    method: 'GET',
    accessToken,
  };
  if (workspace?.practitionerRoleId) {
    queryKey.queryParams = {
      ...(queryKey.queryParams as FilterPractitionerScheduleDto),
      practitionerRoleId: workspace?.practitionerRoleId,
    } as FilterPractitionerScheduleDto;
  }

  const { isLoading, error, data } =
    useAppQuery<ViewPractitionerScheduleDto[]>(queryKey);
  const [sessionToEdit, setSessionToEdit] = useState<
    ViewPractitionerScheduleDto | undefined
  >(undefined);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  const [currentWindow, setCurrentWindow] = useState<CurrentWindow>(
    CurrentWindow.ViewWindow,
  );

  const { createQueryFunction, isLoading: isLoading1 } = useQueryFunction();
  const queryClient = useQueryClient();
  const [confirmationContext, setConfirmationContext] = useState<
    ConfirmationDialogContext | undefined
  >(undefined);

  function invalidateQueries() {
    setSessionToEdit(undefined);
    queryClient.invalidateQueries({ exact: false, queryKey: [queryKey] });
  }

  async function updateSession(data: UpdatePractitionerScheduleDto) {
    const update = createQueryFunction<ViewPractitionerScheduleDto>({
      path: API_PATHS.updatePractitionerSchedule(sessionToEdit!.id),
      method: 'PUT',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      const result = await update();
      setNotification({
        type: 'success',
        title: 'Session Updated Successfully!',
        description: `Reference: ${result.data?.id}`,
      });
      setCurrentWindow(CurrentWindow.ViewWindow);
      invalidateQueries();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error updating Session!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  async function deleteSession(sessionId: string) {
    const deleteSession = createQueryFunction<string>({
      path: API_PATHS.deletePractitionerSchedule(sessionId),
      method: 'DELETE',
      accessToken,
    });

    try {
      setNotification(undefined);
      await deleteSession();
      setNotification({
        type: 'success',
        title: 'Session Deleted Successfully!',
      });
      invalidateQueries();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error deleting Session!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  return (
    <>
      {(isLoading || isLoading1) && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {confirmationContext && (
        <ConfirmationDialog
          isOpen={confirmationContext !== undefined}
          message={confirmationContext.message}
          onConfirm={confirmationContext.onConfirm}
          onClose={confirmationContext.onClose}
        />
      )}
      <div className="w-full flex flex-row flex-wrap gap-6 p-6 bg-background border-default border-border-primary rounded-default drop-shadow-default">
        <div className="w-full pb-2 border-b-default border-border-primary space-y-4">
          <h2 className="text-title">Your Sessions</h2>
          <span className="inline-flex justify-between w-full">
            <RefreshData queryKey={queryKey} />
            {currentWindow === CurrentWindow.ViewWindow ? (
              <div className="w-full flex flex-row gap-4 justify-end items-center">
                <QuickActionButton
                  text="Delete"
                  icon={IconTrash}
                  onClick={() =>
                    setConfirmationContext({
                      message: 'Are you sure want to delete this session?',
                      onConfirm: () => {
                        setConfirmationContext(undefined);
                        deleteSession(sessionToEdit!.id);
                      },
                      onClose: () => {
                        setConfirmationContext(undefined);
                        setSessionToEdit(undefined);
                      },
                    })
                  }
                  isDisabled={!sessionToEdit}
                />
                <QuickActionButton
                  text={
                    sessionToEdit && sessionToEdit.isActive
                      ? 'Deactivate'
                      : 'Activate'
                  }
                  icon={
                    sessionToEdit && sessionToEdit.isActive
                      ? IconStopCircle
                      : IconPlayCircle
                  }
                  onClick={() =>
                    setConfirmationContext({
                      message: `Are you sure want to ${sessionToEdit?.isActive ? 'Deactivate' : 'Activate'} this session?`,
                      onConfirm: () => {
                        setConfirmationContext(undefined);
                        updateSession({
                          startTime: sessionToEdit!.startTime,
                          endTime: sessionToEdit!.endTime,
                          slotDurationMinutes: toNumber(
                            sessionToEdit!.slotDurationMinutes,
                          ),
                          occurrences: sessionToEdit!.occurrences,
                          isActive: sessionToEdit!.isActive ? false : true,
                        });
                      },
                      onClose: () => {
                        setConfirmationContext(undefined);
                        setSessionToEdit(undefined);
                      },
                    })
                  }
                  isDisabled={!sessionToEdit}
                />
                <QuickActionButton
                  text="Edit"
                  icon={IconEdit}
                  onClick={() => setCurrentWindow(CurrentWindow.EditWindow)}
                  isDisabled={!sessionToEdit}
                />
              </div>
            ) : (
              <QuickActionButton
                text="Cancel Edit"
                icon={IconXCircle}
                onClick={() => setCurrentWindow(CurrentWindow.ViewWindow)}
              />
            )}
          </span>
        </div>

        {currentWindow === CurrentWindow.ViewWindow
          ? data &&
            data.map((session) => (
              <div
                key={session.id}
                className={`w-fit bg-background rounded-default flex flex-col gap-2 p-6 justify-between hover:drop-shadow-default hover:cursor-pointer ${
                  session.id === sessionToEdit?.id
                    ? 'border-2 border-green-primary'
                    : 'border-default border-border-primary'
                }`}
                onClick={() => setSessionToEdit(session)}
              >
                <p
                  className={`py-1 px-2 border-default rounded-default inline-flex gap-2 ${session.isActive ? 'bg-green-100 border-green-primary text-green-primary' : 'bg-disabled border-border-primary text-on-disabled'}`}
                >
                  <AppIcon
                    icon={session.isActive ? IconCheckCircle : IconXCircle}
                  />
                  {session.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-title-small">{session.organizationName}</p>
                <p className="text-black-primary inline-flex gap-2">
                  <AppIcon icon={IconClock} />
                  {`${to12HourFormat(session.startTime)} - ${to12HourFormat(session.endTime)}`}
                </p>
                <p className="font-mono">
                  <span className="font-sans text-black-secondary">
                    Occurs On:
                  </span>{' '}
                  {session.occurrences.join(', ')}
                </p>
                <p className="text-small">
                  Approximate duration : {session.slotDurationMinutes} mins
                </p>
              </div>
            ))
          : sessionToEdit && (
              <div className="w-full">
                <UpdatePractitionerScheduleForm
                  defaultData={
                    {
                      startTime: sessionToEdit.startTime,
                      endTime: sessionToEdit.endTime,
                      slotDurationMinutes: toNumber(
                        sessionToEdit.slotDurationMinutes,
                      ),
                      occurrences: sessionToEdit.occurrences,
                      isActive: true,
                    } as UpdatePractitionerScheduleDto
                  }
                  onFormSubmit={(data) => updateSession(data)}
                />
              </div>
            )}
      </div>
    </>
  );
}
