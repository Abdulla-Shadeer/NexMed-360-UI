'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useUser, useWorkspace } from '_context';
import { API_PATHS } from '@/constants';
import {
  AppNotificationType,
  ViewPractitionerScheduleDto,
  UpdatePractitionerScheduleDto,
} from '@/types';
import { SecondaryButton } from '@/components/buttons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import ExpandableCard from '@/components/misc/expandableCard';
import ConfirmationDialog from '@/components/popup/confirmationDialog';
import UpdatePractitionerScheduleForm from './updatePractitionerSchedule';
import { to12HourFormat } from '_utils/dateUtils';

export default function SessionList({
  ownOnly = false,
}: {
  ownOnly?: boolean;
}) {
  const { accessToken } = useUser();
  const { hasPermission } = useWorkspace();
  const canManage = hasPermission('schedules.manage-organization');
  const query = {
    path: API_PATHS.getPractitionerSchedules,
    method: 'GET' as const,
    accessToken,
    queryParams: { ownOnly },
  };
  const { data, error, isLoading } =
    useAppQuery<ViewPractitionerScheduleDto[]>(query);
  const { createQueryFunction, isLoading: saving } = useQueryFunction();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string>();
  const [editing, setEditing] = useState<ViewPractitionerScheduleDto>();
  const [pending, setPending] = useState<{
    session: ViewPractitionerScheduleDto;
    action: 'delete' | 'toggle';
  }>();
  const [notification, setNotification] = useState<AppNotificationType>();
  async function update(
    session: ViewPractitionerScheduleDto,
    change: UpdatePractitionerScheduleDto,
  ) {
    try {
      await createQueryFunction({
        path: API_PATHS.updatePractitionerSchedule(session.id),
        method: 'PUT',
        accessToken,
        payload: change,
      })();
      setEditing(undefined);
      setNotification({ type: 'success', title: 'Session updated' });
      await queryClient.invalidateQueries();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not update session',
        description: (error as Error).message,
      });
    }
  }
  async function confirm() {
    if (!pending || saving) return;
    const { session, action } = pending;
    setPending(undefined);
    if (action === 'toggle') {
      await update(session, {
        startTime: session.startTime,
        endTime: session.endTime,
        slotDurationMinutes: Number(session.slotDurationMinutes),
        occurrences: session.occurrences,
        isActive: !session.isActive,
      });
      return;
    }
    try {
      await createQueryFunction({
        path: API_PATHS.deletePractitionerSchedule(session.id),
        method: 'DELETE',
        accessToken,
      })();
      setNotification({ type: 'success', title: 'Session deleted' });
      await queryClient.invalidateQueries();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not delete session',
        description: (error as Error).message,
      });
    }
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-title">
          {ownOnly ? 'My sessions' : 'Organization sessions'}
        </h1>
        <RefreshData queryKey={query} />
      </div>
      {(isLoading || saving) && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {editing && canManage ? (
        <div className="p-6 space-y-6 bg-panel-light border-default border-border-primary rounded-default">
          <h2 className="text-title-small">
            Edit session: {editing.practitionerName} —{' '}
            {editing.practitionerRole}
          </h2>
          <p>
            {editing.organizationName}
            {editing.locationName ? ` · ${editing.locationName}` : ''}
          </p>
          <fieldset disabled={saving}>
            <UpdatePractitionerScheduleForm
              defaultData={{
                startTime: editing.startTime,
                endTime: editing.endTime,
                slotDurationMinutes: Number(editing.slotDurationMinutes),
                occurrences: editing.occurrences,
                isActive: editing.isActive,
              }}
              onFormSubmit={(change) => update(editing, change)}
            />
          </fieldset>
          <SecondaryButton
            buttonText="Cancel edit"
            initialState="light"
            onClick={() => setEditing(undefined)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((session) => (
            <ExpandableCard
              key={session.id}
              title={`${session.practitionerName} — ${session.isActive ? 'Active' : 'Inactive'}`}
              description={`${session.practitionerRole} · ${session.organizationName}${session.locationName ? ` · ${session.locationName}` : ''} · ${to12HourFormat(session.startTime)} – ${to12HourFormat(session.endTime)}`}
              open={expandedId === session.id}
              onToggle={() =>
                setExpandedId(
                  expandedId === session.id ? undefined : session.id,
                )
              }
            >
              <p>
                {session.practitionerRole} · {session.organizationName}
              </p>
              {session.locationName && <p>Location: {session.locationName}</p>}
              <p>
                {to12HourFormat(session.startTime)} –{' '}
                {to12HourFormat(session.endTime)}
              </p>
              <p>{session.occurrences.join(', ')}</p>
              <p>
                {session.isActive ? 'Active' : 'Inactive'} ·{' '}
                {session.slotDurationMinutes} minutes per slot
              </p>
              {canManage && (
                <div className="flex flex-wrap gap-4">
                  <SecondaryButton
                    buttonText="Edit"
                    initialState="light"
                    disabled={saving}
                    onClick={() => setEditing(session)}
                  />
                  <SecondaryButton
                    buttonText={session.isActive ? 'Deactivate' : 'Activate'}
                    initialState="light"
                    disabled={saving}
                    onClick={() => setPending({ session, action: 'toggle' })}
                  />
                  <SecondaryButton
                    buttonText="Delete"
                    initialState="light"
                    disabled={saving}
                    onClick={() => setPending({ session, action: 'delete' })}
                  />
                </div>
              )}
            </ExpandableCard>
          ))}
        </div>
      )}
      {!isLoading && !data?.length && <p>No sessions found.</p>}
      {pending && (
        <ConfirmationDialog
          isOpen
          message={
            pending.action === 'delete'
              ? 'Delete this session?'
              : `${pending.session.isActive ? 'Deactivate' : 'Activate'} this session?`
          }
          onConfirm={confirm}
          onClose={() => setPending(undefined)}
        />
      )}
    </div>
  );
}
