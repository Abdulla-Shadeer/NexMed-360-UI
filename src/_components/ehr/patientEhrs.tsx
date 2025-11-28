'use client';

import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import {
  AppNotificationType,
  ViewClinicRecordDto,
  ViewPatientDto,
} from '@/types';
import { useAuth } from '_context';
import { useEffect, useState } from 'react';
import Paginator from '../misc/paginator';
import AppLoader from '../misc/loader';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import RefreshData from '../misc/refresh';
import KeyValueData from '@/components/misc/keyValueData';
import { SecondaryButton } from '../buttons';
import { useRouter } from 'next/navigation';

export default function PatientEHRs({
  patient,
  onNotification,
}: {
  patient: ViewPatientDto;
  onNotification: (notification: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const queryKey = {
    path: API_PATHS.getClinicRecords(patient.id),
    method: 'GET',
    accessToken,
  };

  const { data, isLoading, error } = useAppQuery<ViewClinicRecordDto[]>(
    queryKey as ApiRequestOption,
  );
  const [currentPageData, setCurrentPageData] = useState<
    ViewClinicRecordDto[] | undefined
  >(undefined);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      onNotification(error);
    }
  }, [error, onNotification]);

  return (
    <div className="w-full space-y-6 justify-between">
      {isLoading && <AppLoader />}
      <div className="w-full flex flex-row justify-between items-center border-b-default border-border-primary pb-4">
        <h2 className="text-title">EHRs (Electronic Health Records)</h2>
        <RefreshData queryKey={queryKey as ApiRequestOption} />
      </div>
      {currentPageData && currentPageData?.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-6">
          {currentPageData.map((ehr) => (
            <div
              key={ehr.id}
              className="w-[373px] bg-background border-default border-border-primary rounded-default p-6 space-y-3 drop-shadow-default"
            >
              <p className="text-title text-blue-secondary pb-2 mb-6 border-b-default border-border-primary text-center">
                {toDefaultDateFormat(new Date(ehr.visitDate))}
              </p>
              <KeyValueData
                _key="Patient"
                value={`${patient.gender === 'Male' ? 'Mr. ' : 'Ms. '}${patient.firstName} ${patient.lastName}`}
              />
              <KeyValueData _key="Doctor" value={`Dr. ${ehr.doctorName}`} />
              <KeyValueData _key="Diagnosis" value={ehr.diagnosis} />
              <KeyValueData _key="Doctor Note" value={ehr.doctorNotes ?? '~'} />
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
            </div>
          ))}
        </div>
      ) : (
        <p>No data found!</p>
      )}
      {data && (
        <Paginator
          data={data}
          onPagination={(pageData) =>
            setCurrentPageData(pageData as ViewClinicRecordDto[])
          }
          itemsPerPage={6}
        />
      )}
    </div>
  );
}
