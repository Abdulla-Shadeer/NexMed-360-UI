import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification,
  AppointmentStatusDto,
  ViewAppointmentDto,
  ViewAppointmentsFilterDto,
  ViewClinicRecordDto,
  ViewPrescriptionDto,
  ViewUserDto,
} from '@/types';
import { useAuth } from '_context/_auth/authContext';
import { toDefaultDateFormat } from '_utils/dateUtils';
import { createContext, useContext, useState } from 'react';

interface PatientInfo {
  ehrs?: ViewClinicRecordDto[];
  prescriptions?: ViewPrescriptionDto[];
  demographics: ViewUserDto;
}

interface EncounterMeta {
  patientId: string;
  appointmentId: string;
  doctorId: string;
  hospitalId: string;
  patientInfo: PatientInfo;
}

interface EncounterContext {
  isActive: boolean;
  meta: EncounterMeta;
  startEncounter: (patientId: string) => void;
  endEncounter: () => void;
  isLoading: boolean;
  error?: AppNotification;
}

const defaultEncounterContext: EncounterContext = {
  isActive: false,
  meta: {
    patientId: '',
    appointmentId: '',
    doctorId: '',
    hospitalId: '',
    patientInfo: {
      demographics: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        roles: [],
      },
    },
  },
  startEncounter: () => {},
  endEncounter: () => {},
  isLoading: false,
};

const EncounterContext = createContext<EncounterContext>(
  defaultEncounterContext,
);

function EncounterProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [EncounterMeta, setEncounterMeta] = useState<EncounterMeta>(
    defaultEncounterContext.meta,
  );
  const { accessToken, user } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [error, setError] = useState<AppNotification | undefined>(undefined);

  async function fetchAndStart(
    patientId: string,
    appointment: ViewAppointmentDto,
  ) {
    const getDemographics = createQueryFunction<ViewUserDto>({
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

    const meta = {
      patientId,
      doctorId: appointment.doctorId,
      hospitalId: appointment.hospitalId,
      appointmentId: appointment.bookingReference,
      patientInfo: {
        ehrs: ehrs.data,
        prescriptions: ehrs.data?.flatMap((ehr) => ehr.prescriptions ?? []),
        demographics:
          demographics.data ??
          defaultEncounterContext.meta.patientInfo.demographics,
      },
    };

    setEncounterMeta(meta);
    console.log('Encounter Context => Encounter Started!');
    setIsActive(true);
  }

  async function startEncounter(patientId: string) {
    console.log('Encounter Context => Starting...');
    setError(undefined);

    const loadAppointmentFilters = () => {
      const today = new Date();
      const appointmentFilter: ViewAppointmentsFilterDto = {
        fromDate: toDefaultDateFormat(today),
        toDate: toDefaultDateFormat(today),
        patientId,
        doctorId: user?.doctorProfile?.id,
        status: AppointmentStatusDto.Confirmed,
      };
      return appointmentFilter;
    };

    const getAppointments = createQueryFunction<ViewAppointmentDto[]>({
      path: apiPaths.viewOwnAppointments,
      method: 'GET',
      accessToken,
      queryParams: loadAppointmentFilters(),
    });

    try {
      const appointments = await getAppointments();

      if (appointments.data?.length === 1) {
        await fetchAndStart(patientId, appointments.data[0]);
      } else {
        setError({
          type: 'error',
          title: 'Unable to start Encounter!',
          description: `Patient with id ${patientId} doesn't have an Appointment booked.`,
          cause: 'No appointments found!',
        });
      }
    } catch (error) {
      const err = error as Error;
      setError({
        type: 'error',
        title: 'Something went wrong while starting Encounter!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  function endEncounter() {
    console.log('Encounter Context => Encounter ended.');
    // check if the end Encounter called after a successfull Encounter start (isActive === true) and dispatch complete appointment req
    setIsActive(false);
    setEncounterMeta(defaultEncounterContext.meta);
  }

  return (
    <EncounterContext.Provider
      value={{
        isActive,
        meta: EncounterMeta,
        startEncounter,
        endEncounter,
        isLoading,
        error,
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
