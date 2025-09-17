'use client';

import { ViewPrescriptionDto } from '_types/dtos';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import KeyValueData from '../misc/keyValueData';

export default function ViewPrescriptions({
  prescriptions,
}: {
  prescriptions: ViewPrescriptionDto[];
}) {
  return (
    <div className="w-full flex flex-row flex-wrap gap-6">
      {prescriptions.map((item) => (
        <div
          key={item.id}
          className="w-[373px] space-y-3 p-6 border-default border-border-primary rounded-default bg-background drop-shadow-default"
        >
          <p className="w-full text-title text-blue-secondary pb-2 border-b-2 border-dashed border-border-primary inline-flex justify-between items-center">
            {`Issued On: ${toDefaultDateFormat(new Date(item.issuedOn))}`}

            <span
              className={`w-fit px-3 py-1 text-title-small uppercase text-center rounded-large border-default ${item.isActive ? 'bg-green-100 text-green-primary border-green-primary' : 'bg-disabled text-on-disabled border-border-primary'}`}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
          <KeyValueData _key="Medicine" value={item.medicineName} />
          <KeyValueData _key="Dosage" value={item.dosage} />
          <KeyValueData
            _key="Times per Day"
            value={item.timesPerDay.toString()}
          />
          <KeyValueData _key="Duration" value={item.duration} />
          <KeyValueData _key="Is Chronic Use" value={`${item.isLongTermUse}`} />
          <KeyValueData _key="Note" value={item.notes} />
          <KeyValueData _key="Issued At" value={item.issuedAtHospital} />
          <KeyValueData _key="Issued By" value={item.issuedByDoctor} />
          <KeyValueData
            _key="Issued On"
            value={toDisplayDateTimeFormat(new Date(item.issuedOn))}
          />
        </div>
      ))}
    </div>
  );
}
