import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification,
  AppointmentStatusDto,
  ViewAppointmentDto,
  ViewAppointmentsFilterDto,
  ViewClinicRecordDto,
  ViewPatientDto,
  ViewPrescriptionDto,
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
  startEncounter: (patientId: string) => void;
  endEncounter: () => void;
  isLoading: boolean;
  notification?: AppNotification;
}

const defaultEncounterContext: EncounterContext = {
  isActive: false,
  meta: {},
  startEncounter: () => {},
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
  const [notification, setNotification] = useState<AppNotification | undefined>(
    undefined,
  );
  const router = useRouter();

  function resetNotification() {
    setTimeout(() => {
      setNotification(undefined);
    }, 5000);
  }

  async function loadPatientDataAndStart(
    patientId: string,
    appointment: ViewAppointmentDto,
  ) {
    const getDemographics = createQueryFunction<ViewPatientDto>({
      path: apiPaths.getPatient(patientId),
      method: 'GET',
      accessToken,
    });

    const getEhrs = createQueryFunction<ViewClinicRecordDto[]>({
      path: apiPaths.getClinicRecords(patientId),
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
    console.log('Encounter Context => Encounter Started!');
    setIsActive(true);

    const confirmInProgress = createQueryFunction<ViewAppointmentDto>({
      path: apiPaths.confirmEncounterInProgress(appointment.bookingReference),
      method: 'GET',
      accessToken,
    });
    await confirmInProgress();
    setNotification({
      type: 'success',
      title: 'Encounter Started Successfully!',
    });
    resetNotification();
    router.push('/encounter');
  }

  async function startEncounter(patientId: string) {
    console.log('Encounter Context => Starting...');
    setNotification(undefined);

    const loadAppointmentFilters = () => {
      const today = new Date();
      const appointmentFilter: ViewAppointmentsFilterDto = {
        fromDate: toDefaultDateFormat(today),
        toDate: toDefaultDateFormat(today),
        patientId,
        doctorId: user?.doctorProfile?.id,
        hospitalId: user?.doctorProfile?.hospitalId, // Might be removed in future to allow multiple hospital IDs per doctor
        status: AppointmentStatusDto.Arrived,
      };
      return appointmentFilter;
    };

    const getAppointments = createQueryFunction<ViewAppointmentDto[]>({
      path: apiPaths.viewOwnAppointments, // docto's own appointment with given patient id
      method: 'GET',
      accessToken,
      queryParams: loadAppointmentFilters(),
    });

    try {
      const appointments = await getAppointments();

      if (appointments.data?.length === 1) {
        await loadPatientDataAndStart(patientId, appointments.data[0]);
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

  async function endEncounter() {
    // check if the end Encounter called after a successfull Encounter start (isActive === true) and dispatch complete appointment req
    if (isActive) {
      const completeAppointment = createQueryFunction<ViewAppointmentDto>({
        path: apiPaths.completeAppointment(
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
    console.log('Encounter Context => Encounter ended.');
  }

  return (
    <EncounterContext.Provider
      value={{
        isActive,
        meta: encounterMeta,
        startEncounter,
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
