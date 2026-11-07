'use client';

import ViewAppointmentCard from '@/components/appointments/viewAppointmentCard';
import { SecondaryButton } from '@/components/buttons';
import PatientIdForm from '@/components/forms/patientIdForm';
import AddUserForm from '@/components/organization/addUserForm';
import { IconIdentification, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import { API_PATHS } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useAuth } from '_context';
import { useFrontOffice } from '_context/frontOffice/frontOfficeContext';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import { AppNotificationType } from '_types/common';
import {
  AppointmentStatusDto,
  CreatePatientDto,
  ViewAppointmentDto,
  ViewAppointmentsFilterDto,
  ViewSessionHistoryDto,
  ViewUserDto,
} from '_types/dtos';
import { to12HourFormat, toDefaultDateFormat } from '_utils/dateUtils';
import { useEffect, useState } from 'react';

const tabButton =
  'hover:cursor-pointer px-6 py-2 border-default border-border-primary rounded-t-default';
const tabButtonNormal = `${tabButton} bg-panel-light text-blue-secondary hover:text-blue-primary`;
const tabButtonActive = `${tabButton} bg-blue-secondary text-text-light hover:bg-blue-primary`;

/**
 * Operations like receive out patient, admit patient to in patient care, see ongoing session details, etc.. can
 * be performed here
 */
export default function FrontOfficePage() {
  const [activeTab, setActiveTab] = useState<
    'receivePatient' | 'registerPatient' | 'ongoingSessions'
  >('receivePatient');
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const { accessToken } = useAuth();

  async function addPatient(data: CreatePatientDto) {
    const request = createQueryFunction<ViewUserDto>({
      path: API_PATHS.addPatient,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setNotification(undefined);
      await request();
      setNotification({
        type: 'success',
        title: 'Added new Patient!',
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error Creating Patient!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  return (
    <div className="w-full space-y-6">
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}

      <div className="w-full inline-flex gap-1 border-b-default border-border-primary">
        <button
          className={`${activeTab === 'receivePatient' ? tabButtonActive : tabButtonNormal}`}
          onClick={() => setActiveTab('receivePatient')}
        >
          Receive Patient
        </button>
        <button
          className={`${activeTab === 'registerPatient' ? tabButtonActive : tabButtonNormal}`}
          onClick={() => setActiveTab('registerPatient')}
        >
          Register Patient
        </button>
        <button
          className={`${activeTab === 'ongoingSessions' ? tabButtonActive : tabButtonNormal}`}
          onClick={() => setActiveTab('ongoingSessions')}
        >
          Ongoing Sessions
        </button>
      </div>

      {activeTab === 'receivePatient' && (
        <ReceivePatient onNotification={(value) => setNotification(value)} />
      )}
      {activeTab === 'registerPatient' && (
        <AddUserForm
          userType="patient"
          onFormSubmit={(data) => addPatient(data as CreatePatientDto)}
        />
      )}
      {activeTab === 'ongoingSessions' && (
        <OngoingSessions onNotification={(noti) => setNotification(noti)} />
      )}
    </div>
  );
}

function ReceivePatient({
  onNotification,
}: {
  onNotification: (value?: AppNotificationType) => void;
}) {
  const { createQueryFunction, isLoading } = useQueryFunction();
  const { accessToken } = useAuth();
  const { patientMeta, setPatientMeta } = useFrontOffice();

  async function loadPatientAppointments(patientId: string) {
    const today = new Date();
    const appointmentFilter: ViewAppointmentsFilterDto = {
      patientId,
      fromDate: toDefaultDateFormat(today),
      toDate: toDefaultDateFormat(today),
      status: AppointmentStatusDto.Confirmed,
    };
    const load = createQueryFunction<ViewAppointmentDto[]>({
      path: API_PATHS.viewOrganizationAppointments,
      method: 'GET',
      accessToken,
      queryParams: appointmentFilter,
    });

    try {
      onNotification(undefined);
      const result = await load();
      setPatientMeta({
        ...patientMeta,
        appointmentsForToday: result.data,
      });
    } catch (error) {
      const err = error as Error;
      onNotification({
        type: 'error',
        title: "Failed to retrive Patient's appointments",
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  async function confirmPatientArrival(appointmentId: string) {
    const confirm = createQueryFunction<ViewAppointmentDto>({
      path: API_PATHS.confirmPatientArrival(appointmentId),
      method: 'GET',
      accessToken,
    });

    try {
      onNotification(undefined);
      await confirm();
      onNotification({
        type: 'success',
        title: 'Patient Arrival Confirmed!',
      });

      setPatientMeta({
        currentAppointment: {
          ...patientMeta!.currentAppointment!,
          status: AppointmentStatusDto.Arrived,
        },
        appointmentsForToday: undefined,
      });
    } catch (error) {
      const err = error as Error;
      onNotification({
        type: 'error',
        title: 'Unable to confirm Patient arrival!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      <PatientIdForm
        onFormSubmit={(id) => loadPatientAppointments(id)}
        onReset={() => {
          setPatientMeta({
            ...patientMeta,
            appointmentsForToday: undefined,
          });
        }}
      />
      {patientMeta?.appointmentsForToday &&
        patientMeta.appointmentsForToday.length === 0 && (
          <p className="text-display py-6 text-on-disabled">
            No Confirmed Appointments found for Today!
          </p>
        )}
      {patientMeta?.appointmentsForToday &&
        patientMeta.appointmentsForToday.length > 0 && (
          <div className="w-full flex flex-col gap-6">
            <div className="w-full inline-flex items-center justify-between pb-4 border-b-default border-border-primary">
              <p className="text-title">
                {"Select an Appointment to Confirm Patient's Arrival"}
              </p>
              <div className="inline-flex items-center gap-6">
                <SecondaryButton
                  type="button"
                  buttonText="Confirm Arrival"
                  onClick={() => {
                    confirmPatientArrival(
                      patientMeta.currentAppointment?.bookingReference ?? '',
                    );
                  }}
                  initialState="active"
                  withIcon
                  icon={IconIdentification}
                  disabled={!patientMeta.currentAppointment}
                />
                <SecondaryButton
                  type="button"
                  buttonText="Reset"
                  onClick={() => setPatientMeta(undefined)}
                  initialState="light"
                  withIcon
                  icon={IconTrash}
                />
              </div>
            </div>
            <div className="w-full flex flex-row flex-wrap gap-6">
              {patientMeta.appointmentsForToday.map((appt) => (
                <div
                  key={appt.bookingReference}
                  className={`w-fit hover:cursor-pointer ${patientMeta.currentAppointment?.bookingReference === appt.bookingReference ? 'border-3 border-green-primary rounded-default' : ''}`}
                  onClick={() =>
                    setPatientMeta({ ...patientMeta, currentAppointment: appt })
                  }
                >
                  <ViewAppointmentCard appointment={appt} tw_width="w-fit" />
                </div>
              ))}
            </div>
          </div>
        )}
      {!patientMeta?.appointmentsForToday &&
        patientMeta?.currentAppointment && (
          <div className="w-full space-y-6">
            <p className="text-title w-full border-b-default border-border-primary pb-2">
              Recent Arrival
            </p>
            <ViewAppointmentCard appointment={patientMeta.currentAppointment} />
          </div>
        )}
    </div>
  );
}

function OngoingSessions({
  onNotification,
}: {
  onNotification: (notification: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const queryKey: ApiRequestOption = {
    path: API_PATHS.getOngoingSessions,
    method: 'GET',
    accessToken,
  };

  const { isLoading, error, data } =
    useAppQuery<ViewSessionHistoryDto[]>(queryKey);

  useEffect(() => {
    if (error) {
      onNotification(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="w-full h-full space-y-4">
      <RefreshData queryKey={queryKey} />
      <div className="w-full h-full flex items-center justify-center border-default border-border-primary bg-background rounded-default drop-shadow-default">
        {isLoading && <AppLoader />}
        {data && data.length > 0 && (
          <div className="w-full flex flex-row flex-wrap gap-4 p-4">
            {data.map((session) => (
              <div
                className="bg-background border-default border-border-primary rounded-default p-4 space-y-2 drop-shadow-default"
                key={session.id}
              >
                <h2 className="text-title text-center text-green-primary pb-1 mb-2 border-b-2 border-border-primary border-dashed">{`${to12HourFormat(session.startTime)} - ${to12HourFormat(session.endTime)}`}</h2>
                <p>
                  {session.practitionerName} ({session.practitionerSpecialty})
                </p>
                <p>Started at: {to12HourFormat(session.startedTime)}</p>
                <p>Patients arrived: {session.encountersCount}</p>
              </div>
            ))}
          </div>
        )}
        {data && data.length === 0 && (
          <p className="text-title text-on-disabled">
            No Ongoing Sessions Found!
          </p>
        )}
      </div>
    </div>
  );
}
