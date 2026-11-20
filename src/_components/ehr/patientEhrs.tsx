'use client';
import { WorkspaceModes } from '_constants/workspaceModes';

import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import { ViewClinicalRecordDto, ViewPatientDto } from '@/types';
import { useUser, useWorkspace } from '_context';
import { useMemo, useState } from 'react';
import { AppNotification } from '@/components/misc';
import Paginator from '../misc/paginator';
import AppLoader from '../misc/loader';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import RefreshData from '../misc/refresh';
import KeyValueData from '@/components/misc/keyValueData';
import ExpandableCard from '@/components/misc/expandableCard';
import { SecondaryButton } from '../buttons';
import { useRouter } from 'next/navigation';

export default function PatientEHRs({ patient }: { patient: ViewPatientDto }) {
  const { accessToken } = useUser();
  const { workspace } = useWorkspace();
  const queryKey = {
    path:
      workspace?.mode === WorkspaceModes.Patient
        ? '/Patient/MyClinicalRecords'
        : API_PATHS.getClinicalRecords(patient.id),
    method: 'GET',
    accessToken,
  };

  const { data, isLoading, error } = useAppQuery<ViewClinicalRecordDto[]>(
    queryKey as ApiRequestOption,
  );
  const [currentPageData, setCurrentPageData] = useState<
    ViewClinicalRecordDto[] | undefined
  >(undefined);
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string>();

  const records = useMemo(
    () =>
      data
        ? [...data].sort(
            (left, right) =>
              new Date(right.visitDate).getTime() -
              new Date(left.visitDate).getTime(),
          )
        : undefined,
    [data],
  );

  return (
    <div className="w-full space-y-6 justify-between">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-row justify-between items-center border-b-default border-border-primary pb-4">
        <h2 className="text-title">EHRs (Electronic Health Records)</h2>
        <RefreshData queryKey={queryKey as ApiRequestOption} />
      </div>
      {currentPageData && currentPageData?.length > 0 ? (
        <div className="space-y-4">
          {currentPageData.map((ehr) => (
            <ExpandableCard
              key={ehr.id}
              title={`Clinical record · ${toDefaultDateFormat(new Date(ehr.visitDate))}`}
              description={`Source: ${ehr.organizationName} · ${ehr.practitionerName}${ehr.isShared ? ' · Shared, read only' : ''}`}
              open={expandedId === ehr.id}
              onToggle={() =>
                setExpandedId(expandedId === ehr.id ? undefined : ehr.id)
              }
            >
              <KeyValueData
                _key="Patient"
                value={`${patient.firstName} ${patient.lastName}`}
              />
              <KeyValueData
                _key="Practitioner"
                value={`${ehr.practitionerName}`}
              />
              <KeyValueData
                _key="Source organization"
                value={ehr.organizationName}
              />
              {ehr.isShared && (
                <p className="text-blue-secondary">
                  Shared with patient approval. Read only.
                </p>
              )}
              {workspace?.mode === WorkspaceModes.Work &&
                !ehr.isPatientVisible && (
                  <p>Not shown in the patient portal.</p>
                )}
              <KeyValueData _key="Diagnosis" value={ehr.diagnosis} />
              <KeyValueData
                _key="Practitioner Note"
                value={ehr.practitionerNotes ?? '~'}
              />
              <KeyValueData
                _key="Visited"
                value={toDisplayDateTimeFormat(new Date(ehr.visitDate))}
              />
              <KeyValueData
                _key="Followup"
                value={
                  ehr.followUpDate
                    ? toDefaultDateFormat(new Date(ehr.followUpDate))
                    : '~'
                }
              />
              <KeyValueData
                _key="Prescriptions added"
                value={ehr.prescriptions?.length.toString() ?? '0'}
              />
              {ehr.prescriptions && ehr.prescriptions.length > 0 && (
                <SecondaryButton
                  type="button"
                  buttonText="View Prescriptions"
                  onClick={() =>
                    router.push(`/ehr/prescriptions/view/${ehr.id}`)
                  }
                  initialState="active"
                  tw="w-full"
                />
              )}
            </ExpandableCard>
          ))}
        </div>
      ) : (
        <p>No data found!</p>
      )}
      {records && (
        <Paginator
          data={records}
          onPagination={(pageData) =>
            setCurrentPageData(pageData as ViewClinicalRecordDto[])
          }
          itemsPerPage={6}
        />
      )}
    </div>
  );
}
