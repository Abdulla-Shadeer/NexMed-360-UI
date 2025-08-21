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
}

export interface LoginResponseDto {
  user: ViewUserDto;
  accessToken: string;
}

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
  location: string;
  status: string;
}
