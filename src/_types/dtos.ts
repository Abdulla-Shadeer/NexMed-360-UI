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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  patientProfile?: ViewPatientDto;
  doctorProfile?: ViewDoctorDto;
  receptionistProfile?: ViewReceptionistDto;
  hospitalAdminProfile?: ViewHospitalAdminDto;
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

export interface DoctorOverviewDto extends OverviewDto {
  totalPatientsTreated: DatewiseStatsDto;
  upcomingAppointments: number;
  pendingAppointments: number;
  recentAppointments: ViewAppointmentDto[];
}

export interface HospitalOverviewDto extends OverviewDto {
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
  totalHospitals: number;
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
  doctorId: string;
  doctorName: string;
  doctorSpeciality: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
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
  doctorId?: string;
  hospitalId?: string;
  fromDate?: string;
  toDate?: string;
  status?: AppointmentStatusDto;
}

export interface ModifyAppointmentDto {
  id: string;
  patientId?: string;
  doctorId?: string;
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
  entity: 'patient' | 'doctor' | 'hospital';
  inputType: 'name' | 'fullName' | 'email';
  input: string;
}

export interface ViewHospitalDto {
  id: string;
  name: string;
  street?: string;
  city?: string;
  district?: string;
  phone: string;
  grade?: string;
  admins?: ViewUserDto[];
}

export interface ViewDoctorDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  speciality: string;
  hospitalId: string;
  hospitalName: string;
}

export interface ViewPatientDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
}

export interface ViewHospitalAdminDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  hospitalId: string;
  hospitalName: string;
}

export interface ViewReceptionistDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location?: string;
  department?: string;
  hospitalId: string;
  hospitalName: string;
}

export interface CreateHospitalDto {
  name: string;
  street?: string;
  city?: string;
  district?: string;
  phone: string;
  grade?: string;
}
export interface UpdateHospitalDto {
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

export interface CreateHospitalAdminDto {
  personalInformation: RegisterUserDto;
  hospitalId: string;
}

export interface CreateDoctorDto {
  personalInformation: RegisterUserDto;
  hospitalId: string;
  speciality: string;
}

export interface CreateReceptionistDto {
  personalInformation: RegisterUserDto;
  hospitalId: string;
  department: string;
  location: string;
}

export interface CreatePatientDto {
  personalInformation: RegisterUserDto;
  birthDate: string;
  gender: 'Male' | 'Female';
}

export interface ViewPrescriptionDto {
  id: string;
  clinicRecordId: string;
  issuedOn: string;
  issuedByDoctor: string;
  issuedAtHospital: string;
  medicineName: string;
  dosage: string;
  timesPerDay: number;
  durationDays: number;
  notes?: string;
  isActive: boolean;
}

export interface ViewClinicRecordDto {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  doctorNotes?: string;
  followUpDate?: string;
  prescriptions?: ViewPrescriptionDto[];
}

export interface AddClinicRecordDto {
  patientId: string;
  diagnosis: string;
  doctorNotes?: string;
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

export interface SearchDoctorDto {
  name?: string;
  email?: string;
  speciality?: string;
}

export interface ViewDoctorSessionDto {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  slotDurationMinutes: string;
  totalSlots: string;
  occurrences: SessionOccurrenceDto[];
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

export interface CreateDoctorSessionDto {
  doctorId: string;
  startTime: string;
  endTime: string;
  hospitalId: string;
  slotDurationMinutes?: number;
  occurrences: SessionOccurrenceDto[];
}
