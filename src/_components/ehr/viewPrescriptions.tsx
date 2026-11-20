'use client';

import { useState } from 'react';
import ExpandableCard from '@/components/misc/expandableCard';
import { ViewPrescriptionDto } from '_types/dtos';
import { toDefaultDateFormat, toDisplayDateTimeFormat } from '_utils/dateUtils';
import KeyValueData from '../misc/keyValueData';

export default function ViewPrescriptions({
  prescriptions,
}: {
  prescriptions: ViewPrescriptionDto[];
}) {
  const [expandedId, setExpandedId] = useState<string>();
  return (
    <div className="w-full space-y-4">
      {prescriptions.map((item) => (
        <ExpandableCard
          key={item.id}
          title={`${item.medicineName} — ${item.isActive ? 'Active' : 'Inactive'}`}
          description={`${toDefaultDateFormat(new Date(item.issuedOn))} · Source: ${item.issuedAtOrganization} · ${item.issuedByPractitioner}`}
          open={expandedId === item.id}
          onToggle={() =>
            setExpandedId(expandedId === item.id ? undefined : item.id)
          }
        >
          <KeyValueData _key="Medicine" value={item.medicineName} />
          <KeyValueData _key="Dosage" value={item.dosage} />
          <KeyValueData
            _key="Times per Day"
            value={item.timesPerDay.toString()}
          />
          <KeyValueData _key="Duration" value={item.duration} />
          <KeyValueData _key="Is Chronic Use" value={`${item.isLongTermUse}`} />
          <KeyValueData _key="Note" value={item.notes} />
          <KeyValueData _key="Issued At" value={item.issuedAtOrganization} />
          <KeyValueData _key="Issued By" value={item.issuedByPractitioner} />
          <KeyValueData
            _key="Issued On"
            value={toDisplayDateTimeFormat(new Date(item.issuedOn))}
          />
        </ExpandableCard>
      ))}
    </div>
  );
}
