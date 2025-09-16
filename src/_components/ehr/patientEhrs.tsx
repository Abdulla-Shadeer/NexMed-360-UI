import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { AppNotification, ViewClinicRecordDto } from '@/types';
import { useAuth } from '_context';
import { useEffect, useState } from 'react';
import Paginator from '../misc/paginator';
import AppLoader from '../misc/loader';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import RefreshData from '../misc/refresh';

export default function PatientEHRs({
  patientId,
  patientName,
  onNotification,
}: {
  patientId: string;
  patientName?: string;
  onNotification: (notification: AppNotification) => void;
}) {
  const { accessToken } = useAuth();
  const queryKey = {
    path: apiPaths.getClinicRecords(patientId),
    method: 'GET',
    accessToken,
  };
  const { data, isLoading, error } = useAppQuery<ViewClinicRecordDto[]>(
    queryKey as ApiRequestOption,
  );
  const [currentPageData, setCurrentPageData] = useState<
    ViewClinicRecordDto[] | undefined
  >(undefined);

  useEffect(() => {
    if (error) {
      onNotification(error);
    }
  }, [error, onNotification]);

  return (
    <div className="w-full space-y-6 justify-between">
      {isLoading && <AppLoader />}
      <h2 className="text-title">
        {patientName ? `${patientName}\'s` : 'Your'} EHRs (Electronic Health
        Records)
      </h2>
      <RefreshData queryKey={queryKey as ApiRequestOption} />
      {currentPageData && currentPageData?.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-6 p-6 border-default border-border-primary rounded-default bg-background drop-shadow-default">
          {currentPageData.map((ehr) => (
            <div
              key={ehr.id}
              className="w-[373px] bg-amber-50 border-default border-border-primary rounded-default p-6 space-y-3"
            >
              <p className="text-title text-blue-secondary pb-1 border-b-default border-border-primary">
                {toDisplayDateTimeFormat(new Date(ehr.visitDate))}
              </p>
              <KeyValueData _key="Diagnosis" value={ehr.diagnosis} />
              <KeyValueData _key="Doctor" value={`Dr. ${ehr.doctorName}`} />
              <KeyValueData
                _key="Doctor notes"
                value={ehr.doctorNotes ?? '~'}
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
          itemsPerPage={4}
        />
      )}
    </div>
  );
}

function KeyValueData({ _key, value }: { _key: string; value: string }) {
  return (
    <p>
      {_key} :<span className="text-title-small ml-2">{value}</span>
    </p>
  );
}
