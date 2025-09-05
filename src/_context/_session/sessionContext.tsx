import { apiPaths } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  AppNotification,
  AppointmentStatus,
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

interface SessionMeta {
  patientId: string;
  appointmentId: string;
  doctorId: string;
  hospitalId: string;
  patientInfo: PatientInfo;
}

interface SessionContext {
  isActive: boolean;
  meta: SessionMeta;
  showAppointmentsPicker: boolean;
  appointments?: ViewAppointmentDto[];
  onAppointmentPick: (appointmentId: string) => void;
  startSession: (patientId: string) => void;
  endSession: () => void;
  isLoading: boolean;
  error?: AppNotification;
}

const defaultSessionContext: SessionContext = {
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
  showAppointmentsPicker: false,
  onAppointmentPick: () => {},
  startSession: () => {},
  endSession: () => {},
  isLoading: false,
};

const SessionContext = createContext<SessionContext>(defaultSessionContext);

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta>(
    defaultSessionContext.meta,
  );
  const [showAppointmentsPicker, setShowAppointmentsPicker] = useState(false);
  const [appointments, setAppointments] = useState<
    ViewAppointmentDto[] | undefined
  >(undefined);
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
      appointmentId: appointment.id,
      patientInfo: {
        ehrs: ehrs.data,
        prescriptions: ehrs.data?.flatMap((ehr) => ehr.prescriptions ?? []),
        demographics:
          demographics.data ??
          defaultSessionContext.meta.patientInfo.demographics,
      },
    };

    setSessionMeta(meta);
    console.log('Session Context => Session Started!');
    setIsActive(true);
  }

  async function startSession(patientId: string) {
    console.log('Session Context => Starting...');
    setError(undefined);

    const loadAppointmentFilters = () => {
      const today = new Date();
      const appointmentFilter: ViewAppointmentsFilterDto = {
        fromDate: toDefaultDateFormat(today),
        toDate: toDefaultDateFormat(today),
        patientId,
        doctorId: user?.doctorProfile?.id,
        status: 'confirmed' as AppointmentStatus,
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
      } else if (appointments.data && appointments.data.length <= 0) {
        setError({
          type: 'error',
          title: 'Unable to start Session!',
          description: `Patient with id ${patientId} doesn't have an Appointment booked.`,
          cause: 'No appointments found!',
        });
      } else {
        setAppointments(appointments.data);
        setShowAppointmentsPicker(true);
      }
    } catch (error) {
      const err = error as Error;
      setError({
        type: 'error',
        title: 'Something went wrong while starting Session!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : '',
      });
    }
  }

  function endSession() {
    console.log('Session Context => Session ended.');
    // check if the end session called after a successfull session start (isActive === true) and dispatch complete appointment req
    setIsActive(false);
    setSessionMeta(defaultSessionContext.meta);
    setAppointments(undefined);
    setShowAppointmentsPicker(false);
  }

  async function onAppointmentPick(appointmentId: string) {
    const activeAppointment = appointments?.find(
      (appt) => appt.id === appointmentId,
    );
    await fetchAndStart(activeAppointment!.patientId, activeAppointment!);
    setShowAppointmentsPicker(false);
    setAppointments(undefined);
  }

  return (
    <SessionContext.Provider
      value={{
        isActive,
        meta: sessionMeta,
        showAppointmentsPicker,
        appointments,
        startSession,
        endSession,
        onAppointmentPick,
        isLoading,
        error,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

function useSession() {
  const context = useContext(SessionContext);
  return context;
}

export { SessionProvider, useSession };
