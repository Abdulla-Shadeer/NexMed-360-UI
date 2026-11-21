'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser, useWorkspace } from '_context';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { API_PATHS, WorkspaceModes } from '@/constants';
import { AppNotificationType } from '@/types';
import { RecordSharingRequestDto } from '_types/recordSharing';
import { DateInput, Form, TextAreaInput } from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import KeyValueData from '@/components/misc/keyValueData';
import ExpandableCard from '@/components/misc/expandableCard';
import ConfirmationDialog from '@/components/popup/confirmationDialog';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';

function defaultExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDefaultDateFormat(date);
}

export default function RecordSharingRequests({
  patientId,
}: {
  patientId?: string;
}) {
  const { accessToken } = useUser();
  const { workspace, hasPermission } = useWorkspace();
  const isPatient = workspace?.mode === WorkspaceModes.Patient;
  const isWork = workspace?.mode === WorkspaceModes.Work;
  const canRead =
    isPatient || (isWork && hasPermission('clinical-records.read'));
  const canRequest =
    isWork && canRead && !!workspace?.practitionerRoleId && !!patientId;
  const [expandedId, setExpandedId] = useState<string>();
  const [purpose, setPurpose] = useState('');
  const [recordFromDate, setRecordFromDate] = useState('');
  const [recordToDate, setRecordToDate] = useState('');
  const [accessExpiresOn, setAccessExpiresOn] = useState(defaultExpiry);
  const [notification, setNotification] = useState<AppNotificationType>();
  const [decision, setDecision] = useState<{
    request: RecordSharingRequestDto;
    action: 'approve' | 'reject' | 'revoke';
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const pending = useRef(false);
  const { createQueryFunction } = useQueryFunction();
  const queryClient = useQueryClient();
  const query = {
    path: API_PATHS.recordSharing,
    method: 'GET' as const,
    accessToken,
    queryParams: patientId && !isPatient ? { patientId } : undefined,
  };
  const {
    data: requests,
    error,
    isLoading,
  } = useAppQuery<RecordSharingRequestDto[]>(query, canRead);

  async function refresh() {
    await queryClient.invalidateQueries({
      queryKey: [query, workspace?.key],
    });
  }

  async function send() {
    if (pending.current || !canRequest) return;
    if (
      !purpose.trim() ||
      purpose.trim().length > 1000 ||
      !accessExpiresOn ||
      (recordFromDate && recordToDate && recordFromDate > recordToDate)
    ) {
      setNotification({
        type: 'error',
        title: 'Check the purpose, record dates, and access expiry.',
      });
      return;
    }
    pending.current = true;
    setIsSaving(true);
    setNotification(undefined);
    try {
      await createQueryFunction<string>({
        path: API_PATHS.recordSharing,
        method: 'POST',
        accessToken,
        payload: {
          patientId,
          practitionerRoleId: workspace?.practitionerRoleId,
          purpose: purpose.trim(),
          recordFromDate: recordFromDate || undefined,
          recordToDate: recordToDate || undefined,
          accessExpiresOn,
        },
      })();
      setPurpose('');
      setRecordFromDate('');
      setRecordToDate('');
      setAccessExpiresOn(defaultExpiry());
      setNotification({
        type: 'success',
        title: 'Sharing request sent. The patient can respond in Patient mode.',
      });
      await refresh();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not send the request',
        description: (error as Error).message,
      });
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  }

  async function respond() {
    if (!decision || pending.current) return;
    const { request, action } = decision;
    pending.current = true;
    setIsSaving(true);
    setDecision(undefined);
    setNotification(undefined);
    try {
      await createQueryFunction<boolean>({
        path:
          action === 'revoke'
            ? API_PATHS.revokeRecordSharing(request.id)
            : API_PATHS.decideRecordSharing(request.id),
        method: 'POST',
        accessToken,
        payload:
          action === 'revoke' ? undefined : { approve: action === 'approve' },
      })();
      setNotification({
        type: 'success',
        title:
          action === 'approve'
            ? 'Sharing approved'
            : action === 'reject'
              ? 'Request rejected'
              : 'Sharing revoked',
      });
      await refresh();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not update the request',
        description: (error as Error).message,
      });
      await refresh();
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-title">Record sharing requests</h2>
        <SecondaryButton
          buttonText="Refresh requests"
          initialState="light"
          disabled={isLoading || isSaving}
          onClick={refresh}
        />
      </div>
      {notification && <AppNotification notification={notification} />}
      {error && <AppNotification notification={error} />}
      {(isLoading || isSaving) && <AppLoader />}
      {!canRead && (
        <p>You need permission to read clinical records in this workspace.</p>
      )}
      {isPatient ? (
        <p>
          Review who needs your history and why. Approval allows permitted staff
          at the named organization to read your published records. They cannot
          change the originals.
        </p>
      ) : (
        <p>
          Records from other organizations stay private until the patient
          approves a request. Use Patient Care to select a patient and request
          access.
        </p>
      )}
      {canRequest && (
        <fieldset disabled={isSaving}>
          <Form title="Request patient history" action={send}>
            <p className="w-full">
              Leave record dates empty to request all published history recorded
              before approval. Future records are excluded. Access expires at
              the end of the selected expiry date (UTC).
            </p>
            <TextAreaInput
              name="Purpose"
              value={purpose}
              onChange={setPurpose}
              required
              error=""
            />
            <DateInput
              name="Record date from (optional)"
              pickedDate={recordFromDate}
              onPick={setRecordFromDate}
              error=""
            />
            <DateInput
              name="Record date to (optional)"
              pickedDate={recordToDate}
              onPick={setRecordToDate}
              error=""
            />
            <DateInput
              name="Access expires on"
              pickedDate={accessExpiresOn}
              onPick={setAccessExpiresOn}
              required
              error=""
            />
            <SecondaryButton
              type="submit"
              buttonText="Send sharing request"
              initialState="active"
              disabled={isSaving || !purpose.trim()}
              onClick={() => {}}
            />
          </Form>
        </fieldset>
      )}
      {requests?.length === 0 && <p>No sharing requests found.</p>}
      <div className="space-y-6">
        {requests?.map((request) => {
          const expired = new Date(request.expiresAt).getTime() <= Date.now();
          const status =
            expired && ['Pending', 'Approved'].includes(request.status)
              ? 'Expired'
              : request.status;
          return (
            <ExpandableCard
              key={request.id}
              title={`${request.organizationName} — ${status}`}
              description={`${!isPatient ? `${request.patientName} · ` : ''}${request.practitionerName} (${request.practitionerRole}) · Access expires ${toDisplayDateTimeFormat(new Date(request.expiresAt))}`}
              open={expandedId === request.id}
              onToggle={() =>
                setExpandedId(
                  expandedId === request.id ? undefined : request.id,
                )
              }
            >
              {!isPatient && (
                <KeyValueData _key="Patient" value={request.patientName} />
              )}
              <KeyValueData
                _key="Requested by"
                value={`${request.practitionerName} (${request.practitionerRole})`}
              />
              <KeyValueData
                _key="Practitioner contact"
                value={request.practitionerEmail || '~'}
              />
              <KeyValueData
                _key="Organization contact"
                value={request.organizationContact || '~'}
              />
              <KeyValueData _key="Purpose" value={request.purpose} />
              <KeyValueData
                _key="Record dates"
                value={`${request.recordFromDate || 'Any start date'} to ${request.recordToDate || 'Approval date'}`}
              />
              <KeyValueData
                _key="Access expires"
                value={toDisplayDateTimeFormat(new Date(request.expiresAt))}
              />
              {request.requestedAt && (
                <KeyValueData
                  _key="Requested"
                  value={toDisplayDateTimeFormat(new Date(request.requestedAt))}
                />
              )}
              {request.approvedAt && (
                <KeyValueData
                  _key="Approved"
                  value={toDisplayDateTimeFormat(new Date(request.approvedAt))}
                />
              )}
              {request.revokedAt && (
                <KeyValueData
                  _key="Revoked"
                  value={toDisplayDateTimeFormat(new Date(request.revokedAt))}
                />
              )}
              <p>
                Only published records recorded before approval are included.
                Revocation stops future access; it cannot undo information
                already viewed.
              </p>
              {isPatient && status === 'Pending' && (
                <div className="flex flex-wrap gap-4">
                  <SecondaryButton
                    buttonText="Approve"
                    initialState="active"
                    disabled={isSaving}
                    onClick={() => setDecision({ request, action: 'approve' })}
                  />
                  <SecondaryButton
                    buttonText="Reject"
                    initialState="light"
                    disabled={isSaving}
                    onClick={() => setDecision({ request, action: 'reject' })}
                  />
                </div>
              )}
              {isPatient && status === 'Approved' && (
                <SecondaryButton
                  buttonText="Revoke access"
                  initialState="light"
                  disabled={isSaving}
                  onClick={() => setDecision({ request, action: 'revoke' })}
                />
              )}
            </ExpandableCard>
          );
        })}
      </div>
      {decision && (
        <ConfirmationDialog
          isOpen
          message={
            decision.action === 'approve'
              ? `Allow permitted staff at ${decision.request.organizationName} to read your published records from ${decision.request.recordFromDate || 'any start date'} to ${decision.request.recordToDate || 'the approval date'}, recorded before approval, until ${toDisplayDateTimeFormat(new Date(decision.request.expiresAt))}? Future records are excluded.`
              : decision.action === 'reject'
                ? 'Reject this sharing request?'
                : `Stop future shared access under this request for ${decision.request.organizationName}? Other approvals, if any, remain valid.`
          }
          yesText={
            decision.action === 'approve'
              ? 'Approve'
              : decision.action === 'reject'
                ? 'Reject'
                : 'Revoke'
          }
          onConfirm={respond}
          onClose={() => setDecision(undefined)}
        />
      )}
    </div>
  );
}
