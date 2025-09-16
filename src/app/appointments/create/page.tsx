'use client';

import { SecondaryButton } from '@/components/buttons';
import QuickActionButton from '@/components/buttons/quickActionButton';
import { DateInput, Form, RadioInput, TextInput } from '@/components/form';
import AppIcon from '@/components/icons/appIcon';
import {
  IconArrowRight,
  IconCalendarDays,
  IconCheckCircle,
  IconClock,
  IconIdentification,
  IconPlusCircle,
  IconTrash,
} from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import RefreshData from '@/components/misc/refresh';
import DoctorSearch from '@/components/search/doctorSearch';
import { apiPaths, userRoles } from '@/constants';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import { ApiRequestOption } from '_hooks/_api/useQueryFunction';
import { AppNotification as AppNotificationType } from '_types/common';
import {
  CreateAppointmentDto,
  GetSessionSlotsDto,
  ViewAppointmentDto,
  ViewDoctorDto,
  ViewDoctorSessionDto,
  ViewPatientDto,
  ViewSessionSlotDto,
} from '_types/dtos';
import { to12HourFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import { useEffect, useState } from 'react';

enum CreationSteps {
  chooseDoctor = 'Choose Doctor',
  chooseSession = 'Choose Session',
  chooseSlot = 'Choose Slot',
}

interface CreationMeta {
  doctor?: ViewDoctorDto;
  session?: ViewDoctorSessionDto;
  date?: string;
  slot?: ViewSessionSlotDto;
  patient?: ViewPatientDto;
}

const stepButtonStyle =
  'text-default text-left py-1 px-2 border-border-primary border-default cursor-pointer';

export default function CreateAppointmentPage() {
  const { user, accessToken } = useAuth();
  const [appointmentType, setappointmentType] = useState<'mySelf' | 'patient'>(
    !user?.roles.includes(userRoles.patient) ? 'patient' : 'mySelf',
  );
  const [step, setStep] = useState<CreationSteps>(CreationSteps.chooseDoctor);
  const [creationMeta, setCreationMeta] = useState<CreationMeta>({
    patient:
      appointmentType === 'mySelf'
        ? (user?.patientProfile ?? undefined)
        : undefined,
  });
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const { createQueryFunction, isLoading } = useQueryFunction();

  async function setPatient(patientId: string) {
    const getPatient = createQueryFunction<ViewPatientDto>({
      path: apiPaths.getPatient(patientId),
      method: 'GET',
      accessToken,
    });

    try {
      setNotification(undefined);
      const patient = await getPatient();
      setCreationMeta((prev) => ({
        ...prev,
        patient: patient.data,
      }));
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Error Get Patient Details!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  async function bookAppointment() {
    const createAppointment = createQueryFunction<ViewAppointmentDto>({
      path: apiPaths.createAppointment,
      method: 'POST',
      accessToken,
      payload: {
        patientId: creationMeta.patient?.id,
        sessionSlotId: creationMeta.slot?.id,
      } as CreateAppointmentDto,
    });

    try {
      setNotification(undefined);
      const appointment = await createAppointment();
      setCreationMeta({ patient: user?.patientProfile });
      setStep(CreationSteps.chooseDoctor);
      setNotification({
        type: 'success',
        title: 'Appointment Booked Successfully!',
        description: `Please be prepared on ${toDisplayDateTimeFormat(new Date(appointment.data?.appointmentDateTime ?? ''))}`,
        cause: `Booking Reference: ${appointment.data?.bookingReference}`,
      });
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Appointment Failed!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  const { Field, Subscribe, handleSubmit } = useForm({
    defaultValues: { patientId: '' },
    onSubmit: ({ value }) => setPatient(value.patientId),
  });

  useEffect(() => {
    if (appointmentType === 'mySelf' && !creationMeta.patient) {
      setCreationMeta((prev) => ({
        ...prev,
        patient: user?.patientProfile ?? undefined,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentType]);

  return (
    <>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}

      {/* Patient Data */}
      <div className="w-full flex flex-row flex-wrap items-center gap-6 my-6">
        {user?.roles.length && user.roles.length > 1 && (
          <>
            <h2 className="w-full text-title pb-1 border-b-default border-border-primary">
              Book Appointment
            </h2>
            <RadioInput
              name="Who is this appointment for?"
              selectItems={['mySelf', 'patient']}
              selectedItem={appointmentType}
              onChange={(value) => {
                setappointmentType(value as 'mySelf' | 'patient');
                if (value === 'patient') {
                  setCreationMeta((prev) => ({
                    ...prev,
                    patient: undefined,
                  }));
                }
              }}
              error=""
            />
          </>
        )}

        {appointmentType === 'patient' && (
          <Form action={handleSubmit}>
            <Field
              name="patientId"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Patient ID required!' : undefined,
              }}
            >
              {(field) => (
                <TextInput
                  name="Scan or Enter Patient ID"
                  required
                  value={field.state.value}
                  onChange={field.handleChange}
                  error={field.state.meta.errorMap.onChange ?? ''}
                />
              )}
            </Field>
            <Subscribe>
              <SecondaryButton
                type="submit"
                buttonText="Confirm"
                initialState="active"
                withIcon
                icon={IconIdentification}
                onClick={() => {}}
              />
            </Subscribe>
          </Form>
        )}
      </div>

      {/* Other Data */}
      <div className="w-full flex flex-row gap-[2%] flex-wrap lg:flex-nowrapb space-y-6">
        <AppointmentDetails
          creationMeta={creationMeta}
          onConfirm={() => bookAppointment()}
          onReset={() => {
            setCreationMeta({
              patient: user?.patientProfile,
            });
            setStep(CreationSteps.chooseDoctor);
          }}
        />
        <div className="lg:w-[74%] md:w-full sm:w-full p-6 border-default border-border-primary rounded-default bg-background drop-shadow-default flex flex-col gap-6">
          {/* Steps indicator */}
          <div className="flex flex-row items-center gap-1">
            <div
              className={`${stepButtonStyle} ${step === CreationSteps.chooseDoctor ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
            >
              01. Select a Doctor
            </div>
            <div
              className={`${stepButtonStyle} ${step === CreationSteps.chooseSession ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
            >
              02. Pick a Session & Date
            </div>
            <div
              className={`${stepButtonStyle} ${step === CreationSteps.chooseSlot ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
            >
              03. Pick a Slot and Confirm
            </div>
          </div>

          {/* Creation steps */}
          {step === CreationSteps.chooseDoctor ? (
            <div className="w-full space-y-6">
              <DoctorSearch
                onDoctorSelect={(doctor) =>
                  setCreationMeta((prev) => ({
                    ...prev,
                    doctor,
                  }))
                }
                onError={(error) => setNotification(error)}
              />
              <SecondaryButton
                buttonText="Next"
                initialState="active"
                onClick={() => {
                  setStep(CreationSteps.chooseSession);
                  setNotification(undefined);
                }}
                disabled={creationMeta.doctor === undefined}
                withIcon
                icon={IconArrowRight}
              />
            </div>
          ) : step === CreationSteps.chooseSession ? (
            <div className="w-full space-y-6">
              <SessionSelector
                doctorId={creationMeta.doctor?.id ?? ''}
                onSessionSelect={(session) =>
                  setCreationMeta((prev) => ({
                    ...prev,
                    session,
                  }))
                }
                onError={(error) => setNotification(error)}
              />
              <DateInput
                name="Appointment Date"
                description="Choose a date according to the selected session occurrence"
                error=""
                onPick={(date) =>
                  setCreationMeta((prev) => ({
                    ...prev,
                    date,
                  }))
                }
              />
              <SecondaryButton
                buttonText="Next"
                initialState="active"
                onClick={() => {
                  setStep(CreationSteps.chooseSlot);
                  setNotification(undefined);
                }}
                disabled={!(creationMeta.date && creationMeta.session)}
                withIcon
                icon={IconArrowRight}
              />
            </div>
          ) : (
            <SlotSelector
              sessionId={creationMeta.session?.id ?? ''}
              date={creationMeta.date ?? ''}
              onSlotSelect={(slot) =>
                setCreationMeta((prev) => ({
                  ...prev,
                  slot,
                }))
              }
              onError={(error) => {
                setNotification(error);
                setStep(CreationSteps.chooseSession);
                setCreationMeta((prev) => ({
                  ...prev,
                  date: undefined,
                  session: undefined,
                }));
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

function AppointmentDetails({
  creationMeta,
  onConfirm,
  onReset,
}: {
  creationMeta: CreationMeta;
  onConfirm: () => void;
  onReset: () => void;
}) {
  return (
    <div className="lg:w-[24%] md:w-fit sm:w-fit h-fit p-6 bg-panel-light border-default border-border-primary rounded-default flex flex-col gap-4 text-default text-black-secondary justify-between">
      <p className="text-title-small pb-1 border-b-default border-border-primary text-blue-secondary">
        Appointment Details
      </p>
      <p>
        Patient:
        {creationMeta.patient ? (
          <span className="font-semibold">{` ${creationMeta.patient.gender === 'Male' ? 'Mr.' : 'Ms.'} ${creationMeta.patient?.firstName} ${creationMeta.patient?.lastName}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Doctor:
        {creationMeta.doctor ? (
          <span className="font-semibold">{` Dr. ${creationMeta.doctor?.firstName} ${creationMeta.doctor?.lastName}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Hospital:
        {creationMeta.doctor ? (
          <span className="font-semibold">{` ${creationMeta.doctor.hospitalName}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Session:
        {creationMeta.session ? (
          <span className="font-semibold">
            {` ${to12HourFormat(creationMeta.session.startTime)} - ${to12HourFormat(creationMeta.session.endTime)}`}
          </span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Date:
        {creationMeta.date ? (
          <span className="font-semibold">{` ${creationMeta.date}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Time:
        {creationMeta.slot ? (
          <span className="font-semibold">{` ${to12HourFormat(creationMeta.slot.startTime)} - ${to12HourFormat(creationMeta.slot.endTime)}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <div className="inline-flex flex-wrap gap-2 mt-12">
        <SecondaryButton
          buttonText="Confirm"
          onClick={onConfirm}
          withIcon
          icon={IconCalendarDays}
          initialState="active"
          tw="w-full"
          disabled={
            !(
              creationMeta.doctor &&
              creationMeta.session &&
              creationMeta.date &&
              creationMeta.slot
            )
          }
        />
        <SecondaryButton
          buttonText="Reset"
          onClick={onReset}
          withIcon
          icon={IconTrash}
          initialState="light"
          tw="w-full"
        />
      </div>
    </div>
  );
}

function SessionSelector({
  doctorId,
  onSessionSelect,
  onError,
}: {
  doctorId: string;
  onSessionSelect: (session: ViewDoctorSessionDto) => void;
  onError: (error: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const requestOption: ApiRequestOption = {
    path: apiPaths.getDoctorSessions(doctorId),
    method: 'GET',
    accessToken,
  };
  const { data, error, isLoading } =
    useAppQuery<ViewDoctorSessionDto[]>(requestOption);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="w-full flex flex-col gap-6">
      <RefreshData queryKey={requestOption} />
      <div className="w-full flex flex-row flex-wrap gap-6 max-h-[430px] overflow-auto">
        {isLoading && <AppLoader />}
        {data && data.length === 0 && (
          <p>No Sessions Found For the Selected Doctor!</p>
        )}
        {data &&
          data.map((session) => (
            <div
              key={session.id}
              className={`w-fit bg-background ${selectedSessionId === session.id ? 'border-green-primary border-2' : 'border-border-primary border-default'} rounded-default flex flex-col gap-2 p-6 justify-between`}
            >
              <p className="text-title-small">{session.hospitalName}</p>
              <p className="text-black-primary inline-flex gap-2">
                <AppIcon icon={IconClock} />
                {`${to12HourFormat(session.startTime)} - ${to12HourFormat(session.endTime)}`}
              </p>
              <p className="font-mono">
                <span className="font-sans text-black-secondary">
                  Occurs On:
                </span>{' '}
                {session.occurrences.join(', ')}
              </p>
              <p className="text-small">
                Approximate duration : {session.slotDurationMinutes} mins
              </p>
              <QuickActionButton
                text={
                  selectedSessionId === session.id
                    ? 'Selected'
                    : 'Select Session'
                }
                onClick={() => {
                  onSessionSelect(session);
                  setSelectedSessionId(session.id);
                }}
                icon={
                  selectedSessionId === session.id
                    ? IconCheckCircle
                    : IconPlusCircle
                }
              />
            </div>
          ))}
      </div>
    </div>
  );
}

function SlotSelector({
  sessionId,
  date,
  onSlotSelect,
  onError,
}: {
  sessionId: string;
  date: string;
  onSlotSelect: (slot: ViewSessionSlotDto) => void;
  onError: (error: AppNotificationType) => void;
}) {
  const { accessToken } = useAuth();
  const requestOption: ApiRequestOption = {
    path: apiPaths.getSessionSlots,
    method: 'GET',
    accessToken,
    queryParams: {
      sessionId,
      date,
    } as GetSessionSlotsDto,
  };
  const { data, error, isLoading } =
    useAppQuery<ViewSessionSlotDto[]>(requestOption);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="w-full flex flex-col gap-6">
      <RefreshData queryKey={requestOption} />
      <div className="w-full flex flex-row flex-wrap gap-6 max-h-[430px] overflow-auto">
        {isLoading && <AppLoader />}
        {data &&
          data
            .sort((slotA, slotB) => slotA.slotNumber - slotB.slotNumber)
            .map((slot) => (
              <div
                key={slot.id}
                className={`w-fit bg-background ${selectedSlotId === slot.id ? 'border-green-primary border-2' : 'border-border-primary border-default'} rounded-default flex flex-col gap-2 p-6 justify-between`}
              >
                <p className="text-title-small">Number: {slot.slotNumber}</p>
                <p className="text-black-primary inline-flex gap-2">
                  <AppIcon icon={IconClock} />
                  {`${to12HourFormat(slot.startTime)} - ${to12HourFormat(slot.endTime)}`}
                </p>
                <p
                  className={`font-mono ${slot.isAvailable && slot.bookingAllowed ? 'text-green-600' : 'text-red-primary'}`}
                >
                  {!slot.bookingAllowed
                    ? 'Booking Not Allowed'
                    : slot.isAvailable
                      ? 'Available'
                      : 'Booked'}
                </p>
                {slot.bookingAllowed && slot.isAvailable && (
                  <QuickActionButton
                    text={
                      selectedSlotId === slot.id ? 'Selected' : 'Select Session'
                    }
                    onClick={() => {
                      onSlotSelect(slot);
                      setSelectedSlotId(slot.id);
                    }}
                    icon={
                      selectedSlotId === slot.id
                        ? IconCheckCircle
                        : IconPlusCircle
                    }
                  />
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
