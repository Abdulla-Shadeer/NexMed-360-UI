import { ViewAppointmentDto } from '_types/dtos';
import { getAppointmentStatusStyle } from '_utils/styleUtils';
import { startCase } from 'lodash';
import KeyValueData from '../misc/keyValueData';
import { toDisplayDateTimeFormat } from '_utils/dateUtils';

export default function ViewAppointmentCard({
  appointment,
  tw_width = 'w-full',
}: {
  appointment: ViewAppointmentDto;
  tw_width?: string;
}) {
  return (
    <div
      className={`${tw_width} space-y-3 bg-background border-default border-border-primary rounded-default drop-shadow-default p-6`}
    >
      <div className="flex flex-row items-center justify-between pb-2 border-b-default border-border-primary mb-6">
        <p className="text-display">No: 0{appointment.appointmentNumber}</p>
        <p className="font-serif font-medium text-lg">{`(${toDisplayDateTimeFormat(new Date(appointment.appointmentDateTime))})`}</p>
        <p className={getAppointmentStatusStyle(appointment.status)}>
          {startCase(appointment.status)}
        </p>
      </div>
      <KeyValueData _key="Patient" value={appointment.patientName} />
      <KeyValueData
        _key="PractitionerRole"
        value={`${appointment.practitionerName} (${appointment.practitionerSpecialty})`}
      />
      <KeyValueData _key="Booked By" value={appointment.createdByUserName} />
      <KeyValueData _key="Organization" value={appointment.organizationName} />
      <KeyValueData _key="Location" value={appointment.organizationAddress} />
      <KeyValueData
        _key="Organization Contact"
        value={appointment.organizationPhone}
      />
      <KeyValueData
        _key="Patient Contact"
        value={`${appointment.patientPhone}, ${appointment.patientEmail}`}
      />
      <KeyValueData
        _key="Booking Reference"
        value={appointment.bookingReference}
      />
    </div>
  );
}
