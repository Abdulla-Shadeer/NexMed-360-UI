import { AppointmentStatusDto } from '_types/dtos';

export function getAppointmentStatusStyle(status: AppointmentStatusDto) {
  return `text-default px-3 py-1 text-title rounded-default ${status === AppointmentStatusDto.Pending ? 'bg-amber-200 text-text-dark' : status === AppointmentStatusDto.Confirmed ? 'bg-green-200 text-text-dark' : status === AppointmentStatusDto.Arrived ? 'bg-lime-500 text-text-dark' : status === AppointmentStatusDto.InProgress ? 'bg-violet-800 text-text-light' : status === AppointmentStatusDto.Completed ? 'bg-green-primary text-text-light' : status === AppointmentStatusDto.CancelRequested ? 'bg-amber-600 text-text-light' : 'bg-red-primary text-text-light'}`;
}
