import { KeyValuePair } from './common';

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ApiErrorDto {
  code: string;
  title?: string;
  description?: string;
  httpStatus: number;
}

export interface ApiResultDto<T> {
  isSuccess: boolean;
  error?: ApiErrorDto;
  data?: T;
}

export interface ViewUserDto {
  personId: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface LoginResponseDto {
  user: ViewUserDto;
  accessToken: string;
}

// Overview
// ********

export interface OverviewDto {
  name: string;
}

export interface PractitionerRoleOverviewDto extends OverviewDto {
  totalPatientsTreated: DatewiseStatsDto;
  upcomingAppointments: number;
  pendingAppointments: number;
  recentAppointments: ViewAppointmentDto[];
}

export interface OrganizationOverviewDto extends OverviewDto {
  totalPatients: DatewiseStatsDto;
  availableBeds: CapacityDto;
  staffOnDutyToday?: CapacityDto;
  pendingAppointments?: number;
  // [{key: "Jan", Value: 0},{key: "Feb", Value: 0}]
  patientTrendsOverMonths?: KeyValuePair<string, number>[];
  recentAppointments?: ViewAppointmentDto[];
}

export interface PatientOverviewDto extends OverviewDto {
  totalEHRs: DatewiseStatsDto;
  activePrescriptions: number;
  upcomingAppointments: number;
  recentAppointments?: ViewAppointmentDto[];
}

export interface SystemOverviewDto extends OverviewDto {
  totalPatients: number;
  totalOrganizations: number;
  totalMedicalStaff: number;
  totalUsers: number;
  totalEHRs: number;
}

export interface CapacityDto {
  totalCapacity: number;
  availableCapacity: number;
}

export interface DatewiseStatsDto {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

// Appointment
// ***********

export enum AppointmentStatusDto {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Arrived = 'Arrived',
  InProgress = 'InProgress',
  CancelRequested = 'CancelRequested',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export interface ViewAppointmentDto {
  bookingReference: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  practitionerRoleId: string;
  practitionerName: string;
  practitionerSpecialty: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  organizationPhone: string;
  createdByUserId: string;
  createdByUserName: string;
  appointmentDateTime: string;
  appointmentNumber: string;
  remarks?: string;
  status: AppointmentStatusDto;
}

export interface CreateAppointmentDto {
  patientId: string;
  sessionSlotId: string;
  remarks?: string;
}

export interface ViewAppointmentsFilterDto {
  patientId?: string;
  practitionerRoleId?: string;
  organizationId?: string;
  fromDate?: string;
  toDate?: string;
  status?: AppointmentStatusDto;
}

export interface ModifyAppointmentDto {
  id: string;
  patientId?: string;
  practitionerRoleId?: string;
  appointmentDateTime?: string;
  remarks?: string;
}

export interface CancellationRequestDto {
  appointmentId: string;
  reason: string;
}

// Search
// ******
export interface SearchDto {
  entity: 'patient' | 'practitionerRole' | 'organization';
  inputType: 'name' | 'fullName' | 'email';
  input: string;
}

export interface ViewOrganizationDto {
  type?: string;
  id: string;
  name: string;
  street?: string;
  city?: string;
  district?: string;
  phone: string;
  grade?: string;
}

export interface ViewPractitionerRoleDto {
  practitionerId: string;
  roleName: string;
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  organizationId: string;
  organizationName: string;
}

export interface ViewPatientDto {
  personId: string;
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
}

export interface CreateOrganizationDto {
  type?: string;
  name: string;
  street?: string;
  city?: string;
  district?: string;
  phone: string;
  grade?: string;
}
export interface UpdateOrganizationDto {
  type?: string;
  id: string;
  name?: string;
  street?: string;
  city?: string;
  district?: string;
  phone?: string;
  grade?: string;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface CreateOrganizationManagerDto {
  permissions?: string[];
  personalInformation: RegisterUserDto;
  organizationId: string;
}

export interface CreatePractitionerRoleDto {
  locationId?: string | null;
  roleName?: string;
  personalInformation: RegisterUserDto;
  organizationId: string;
  specialty: string;
}

export interface CreateOrganizationMemberDto {
  personalInformation: RegisterUserDto;
  organizationId: string;
  locationId?: string | null;
}

export interface CreatePatientDto {
  personalInformation: RegisterUserDto;
  birthDate: string;
  gender: 'Male' | 'Female';
}

export interface ViewPrescriptionDto {
  id: string;
  clinicalRecordId: string;
  issuedOn: string;
  issuedByPractitioner: string;
  issuedAtOrganization: string;
  medicineName: string;
  dosage: string;
  timesPerDay: number;
  isLongTermUse: boolean;
  duration?: string;
  notes?: string;
  isActive: boolean;
}

export interface ViewClinicalRecordDto {
  id: string;
  patientId: string;
  patientName: string;
  practitionerRoleId: string;
  practitionerName: string;
  visitDate: string;
  diagnosis: string;
  practitionerNotes?: string;
  followUpDate?: string;
  prescriptions?: ViewPrescriptionDto[];
}

export interface AddClinicalRecordDto {
  practitionerRoleId: string;
  patientId: string;
  diagnosis: string;
  practitionerNotes?: string;
  visitDate: string;
  followUpDate?: string;
  prescriptions?: AddPrescriptionDto[];
}

export interface AddPrescriptionDto {
  medicineName: string;
  dosage: string;
  timesPerDay: number;
  isLongTermUse?: boolean;
  duration?: string;
  notes?: string;
}

export interface SearchPractitionerRoleDto {
  name?: string;
  email?: string;
  specialty?: string;
}

export interface ViewPractitionerScheduleDto {
  id: string;
  practitionerRoleId: string;
  startTime: string;
  endTime: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  slotDurationMinutes: string;
  totalSlots: string;
  occurrences: SessionOccurrenceDto[];
  isActive: boolean;
}

export enum SessionOccurrenceDto {
  Weekdays = 'Weekdays',
  Weekend = 'Weekend',
  AllDays = 'AllDays',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export interface ViewSessionSlotDto {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
  bookingAllowed: boolean;
  slotNumber: number;
}

export interface GetSessionSlotsDto {
  sessionId: string;
  date: string;
}

export interface CreatePractitionerScheduleDto {
  practitionerRoleId: string;
  startTime: string;
  endTime: string;
  organizationId: string;
  slotDurationMinutes?: number;
  occurrences: SessionOccurrenceDto[];
}

export interface FilterPractitionerScheduleDto {
  date?: string;
  organizationId?: string;
  practitionerRoleId?: string;
  sessionStatus?: SessionStatusDto;
  isActive?: boolean;
}

export enum SessionStatusDto {
  Started = 'Started',
  Ended = 'Ended',
  Canceled = 'Canceled',
}

export interface FilterSessionsForCurrentDayDto {
  date: string;
  practitionerRoleId: string;
  organizationId: string;
}

export interface ViewCurrentOrNextSessionDto {
  isCurrent: boolean;
  sessionId: string;
  startTime: string;
  endTime: string;
  // below are applicable only if the session is current
  startedTime?: string;
  lastKnownAppointmentId?: string;
  encountersCount?: number;
}

export interface ViewSessionHistoryDto {
  id: string;
  practitionerScheduleId: string;
  practitionerName: string;
  practitionerSpecialty: string;
  date: string;
  startTime: string;
  endTime: string;
  endedTime: string;
  startedTime: string;
  sessionStatus: SessionStatusDto;
  encountersCount: number;
  lastKnownAppointmentId?: string;
}

export interface UpdateSessionHistoryDto {
  sessionId: string;
  date: string;
  sessionStatus?: SessionStatusDto;
  lastKnownAppointmentId?: string;
}

export interface UpdatePractitionerScheduleDto {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  occurrences: SessionOccurrenceDto[];
  isActive: boolean;
}
