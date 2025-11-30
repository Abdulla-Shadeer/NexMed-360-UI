import { ViewPatientDto } from '_types/dtos';

export function toFullNameWithTitle(patient: ViewPatientDto) {
  return `${patient.gender === 'Male' ? 'Mr. ' : 'Ms. '}${patient.firstName} ${patient.lastName}`;
}
