import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotificationType,
  AppointmentStatusDto,
  UpdateSessionHistoryDto,
  ViewAppointmentDto,
  ViewClinicRecordDto,
  ViewPatientDto,
  ViewPrescriptionDto,
  ViewSessionHistoryDto,
} from '@/types';
import { useAuth } from '_context/_auth/authContext';
import { toDefaultDateFormat } from '_utils/dateUtils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState } from 'react';

interface PatientData {
  ehrs?: ViewClinicRecordDto[];
  prescriptions?: ViewPrescriptionDto[];
  demographics?: ViewPatientDto;
}

export interface EncounterMeta {
  appointmentData?: ViewAppointmentDto;
  patientData?: PatientData;
}

interface EncounterContext {
  isActive: boolean;
  meta: EncounterMeta;
  startEncounter: (doctorSessionId: string, patientId: string) => void;
  tryContinueEncounter: (
    doctorSessionId: string,
    lastKnownApptId: string,
  ) => void;
  endEncounter: () => void;
  isLoading: boolean;
  notification?: AppNotificationType;
}

const defaultEncounterContext: EncounterContext = {
  isActive: false,
  meta: {},
  startEncounter: () => {},
  tryContinueEncounter: () => {},
  endEncounter: () => {},
  isLoading: false,
};

const EncounterContext = createContext<EncounterContext>(
  defaultEncounterContext,
);

function EncounterProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [encounterMeta, setEncounterMeta] = useState<EncounterMeta>(
    defaultEncounterContext.meta,
  );
  const { accessToken, user } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const router = useRouter();

  function resetNotification() {
    setTimeout(() => {
      setNotification(undefined);
    }, 5000);
  }

  async function loadPatientDataAndStart(
    patientId: string,
    appointment: ViewAppointmentDto,
    doctorSessionId: string,
  ) {
    const getDemographics = createQueryFunction<ViewPatientDto>({
      path: API_PATHS.getPatient(patientId),
      method: 'GET',
      accessToken,
    });

    const getEhrs = createQueryFunction<ViewClinicRecordDto[]>({
      path: API_PATHS.getClinicRecords(patientId),
      method: 'GET',
      accessToken,
    });
    const [demographics, ehrs] = await Promise.all([
      getDemographics(),
      getEhrs(),
    ]);

    const meta: EncounterMeta = {
      appointmentData: appointment,
      patientData: {
        ehrs: ehrs.data ?? [],
        prescriptions: ehrs.data?.flatMap((ehr) => ehr.prescriptions ?? []),
        demographics: demographics.data,
      },
    };

    setEncounterMeta(meta);
    setIsActive(true);

    const confirmInProgress = createQueryFunction<ViewAppointmentDto>({
      path: API_PATHS.confirmEncounterInProgress(appointment.bookingReference),
      method: 'GET',
      accessToken,
    });

    const update: UpdateSessionHistoryDto = {
      sessionId: doctorSessionId,
      date: toDefaultDateFormat(new Date()),
      lastKnownAppointmentId: appointment.bookingReference,
    };
    const updateSessionHistory = createQueryFunction<ViewSessionHistoryDto>({
      path: API_PATHS.updateDoctorSessionHistory,
      method: 'POST',
      accessToken,
      payload: update,
    });

    await Promise.all([confirmInProgress(), updateSessionHistory()]);

    setNotification({
      type: 'success',
      title: 'Encounter Started/Continued Successfully!',
    });
    resetNotification();
    router.push('/encounter');
  }

  async function startEncounter(sessionId: string, patientId: string) {
    setNotification(undefined);

    const loadAppointmentFilters = () => {
      const today = new Date();
      return {
        fromDate: toDefaultDateFormat(today),
        toDate: toDefaultDateFormat(today),
        patientId,
        doctorId: user?.doctorProfile?.id,
        hospitalId: user?.doctorProfile?.hospitalId, // Might be removed in future to allow multiple hospital IDs per doctor
        status: AppointmentStatusDto.Arrived,
      };
    };

    const getAppointments = createQueryFunction<ViewAppointmentDto[]>({
      path: API_PATHS.viewOwnAppointments, // doctor's own appointment with given patient id
      method: 'GET',
      accessToken,
      queryParams: loadAppointmentFilters(),
    });

    try {
      const appointments = await getAppointments();

      if (appointments.data?.length === 1) {
        await loadPatientDataAndStart(
          patientId,
          appointments.data[0],
          sessionId,
        );
      } else {
        setNotification({
          type: 'error',
          title: 'Unable to start Encounter!',
          description: `Patient doesn't have an appointment booked or arrival confirmed at the front desk.`,
          cause: 'No appointments found with Arrived status!',
        });
      }
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Something went wrong while starting Encounter!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  async function tryContinueEncounter(
    doctorSessionId: string,
    lastKnownApptId: string,
  ) {
    setNotification(undefined);

    const getAppointment = createQueryFunction<ViewAppointmentDto>({
      path: API_PATHS.viewAppointmentById(lastKnownApptId),
      method: 'GET',
      accessToken,
    });

    try {
      const appointment = (await getAppointment()).data;
      if (
        appointment &&
        appointment.status === AppointmentStatusDto.InProgress
      ) {
        loadPatientDataAndStart(
          appointment.patientId,
          appointment,
          doctorSessionId,
        );
      }
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Something went wrong while continuing Encounter!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  async function endEncounter() {
    // check if the end Encounter called after a successfull Encounter start (isActive === true) and dispatch complete appointment req
    if (isActive) {
      const completeAppointment = createQueryFunction<ViewAppointmentDto>({
        path: API_PATHS.completeAppointment(
          encounterMeta.appointmentData?.bookingReference || '',
        ),
        method: 'GET',
        accessToken,
      });
      await completeAppointment();
      setNotification({
        type: 'success',
        title: 'Encounter Completed!',
        description: `Patient: ${encounterMeta.appointmentData?.patientName}`,
        cause: `Appointment Number: ${encounterMeta.appointmentData?.appointmentNumber}`,
      });
    }
    setIsActive(false);
    setEncounterMeta(defaultEncounterContext.meta);
  }

  return (
    <EncounterContext.Provider
      value={{
        isActive,
        meta: encounterMeta,
        startEncounter,
        tryContinueEncounter,
        endEncounter,
        isLoading,
        notification: notification,
      }}
    >
      {children}
    </EncounterContext.Provider>
  );
}

function useEncounter() {
  const context = useContext(EncounterContext);
  return context;
}

export { EncounterProvider, useEncounter };
