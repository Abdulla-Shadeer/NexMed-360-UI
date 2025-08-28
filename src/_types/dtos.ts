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

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  CancelRequested = 'cancelRequested',
  Cancelled = 'cancelled',
  Completed = 'completed',
}
export interface ViewAppointmentDto {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  doctorSpeciality: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  createdByUserId: string;
  createdByUserName: string;
  appointmentDateTime: string;
  remarks?: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDateTime: string;
  remarks?: string;
}

export interface ViewAppointmentsFilterDto {
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  fromDate?: string;
  toDate?: string;
  status?: AppointmentStatus;
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
}

export interface ViewDoctorDto {
  id: string;
  speciality: string;
  hospitalId: string;
  hospitalName: string;
}

export interface ViewPatientDto {
  id: string;
  birthDate: string;
  gender: string;
}

export interface ViewHospitalAdminDto {
  id: string;
  hospitalId: string;
  hospitalName: string;
}

export interface ViewReceptionistDto {
  id: string;
  location?: string;
  department?: string;
  hospitalId: string;
  hospitalName: string;
}
