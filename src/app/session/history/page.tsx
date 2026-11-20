'use client';
import { useState } from 'react';
import { useAppQuery } from '@/hooks';
import { useUser, useWorkspace } from '_context';
import { API_PATHS } from '@/constants';
import { ViewSessionHistoryDto } from '@/types';
import { DateInput, SelectInput } from '@/components/input';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import ExpandableCard from '@/components/misc/expandableCard';
import { to12HourFormat } from '_utils/dateUtils';

export default function SessionHistoryPage() {
  const { accessToken } = useUser();
  const { workspace, hasPermission } = useWorkspace();
  const canReadOrganization =
    hasPermission('schedules.read-organization') ||
    hasPermission('schedules.manage-organization');
  const canReadOwn =
    hasPermission('schedules.read-own') &&
    !!workspace?.practitionerAssignments?.length;
  const [view, setView] = useState(
    canReadOrganization ? 'organization' : 'own',
  );
  const ownOnly = canReadOwn && (!canReadOrganization || view === 'own');
  const [expandedId, setExpandedId] = useState<string>();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const query = {
    path: API_PATHS.getPractitionerScheduleHistory,
    method: 'GET' as const,
    accessToken,
    queryParams: {
      ownOnly,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    },
  };
  const { data, error, isLoading } = useAppQuery<ViewSessionHistoryDto[]>(
    query,
    canReadOwn || canReadOrganization,
  );
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-title">
          {ownOnly ? 'My session history' : 'Organization session history'}
        </h1>
        <RefreshData queryKey={query} />
      </div>
      <p>View session times, status, and encounter counts.</p>
      <div className="flex flex-wrap gap-6">
        {canReadOrganization && canReadOwn && (
          <SelectInput
            name="View"
            selected={ownOnly ? 'own' : 'organization'}
            onSelect={setView}
            options={[
              { key: 'organization', value: 'Organization sessions' },
              { key: 'own', value: 'My sessions' },
            ]}
            error=""
          />
        )}
        <DateInput
          name="From date"
          pickedDate={fromDate}
          onPick={setFromDate}
          error=""
        />
        <DateInput
          name="To date"
          pickedDate={toDate}
          onPick={setToDate}
          error=""
        />
      </div>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="space-y-4">
        {data?.map((row) => (
          <ExpandableCard
            key={row.id}
            title={`${row.practitionerName} — ${row.sessionStatus}`}
            description={`${row.date} · ${row.practitionerSpecialty} · ${row.encountersCount} encounters`}
            open={expandedId === row.id}
            onToggle={() =>
              setExpandedId(expandedId === row.id ? undefined : row.id)
            }
          >
            <p>{row.practitionerSpecialty}</p>
            <p>
              {row.date} · {row.sessionStatus}
            </p>
            <p>
              Scheduled: {to12HourFormat(row.startTime)} –{' '}
              {to12HourFormat(row.endTime)}
            </p>
            <p>Started: {to12HourFormat(row.startedTime)}</p>
            {row.sessionStatus === 'Ended' && (
              <p>Ended: {to12HourFormat(row.endedTime)}</p>
            )}
            <p>Encounter count: {row.encountersCount}</p>
          </ExpandableCard>
        ))}
      </div>
      {!isLoading && !data?.length && <p>No session history found.</p>}
    </div>
  );
}
