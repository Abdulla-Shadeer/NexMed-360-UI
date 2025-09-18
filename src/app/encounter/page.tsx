'use client';

import { CreateEHR } from '@/components/ehr';
import PatientEHRs from '@/components/ehr/patientEhrs';
import ViewPrescriptions from '@/components/ehr/viewPrescriptions';
import { AppNotification } from '@/components/misc';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { useEncounter } from '_context/_encounter/encounterContext';
import { AppNotificationType as AppNotificationType } from '_types/common';
import { calculateAge } from '_utils/dateUtils';
import { useState } from 'react';

const tabButton =
  'hover:cursor-pointer px-6 py-2 border-default border-border-primary rounded-t-default';
const tabButtonNormal = `${tabButton} bg-panel-light text-blue-secondary hover:text-blue-primary`;
const tabButtonActive = `${tabButton} bg-blue-secondary text-text-light hover:bg-blue-primary`;

export default function EncounterPage() {
  const { isActive, meta } = useEncounter();
  const [activeTab, setActiveTab] = useState<
    'demography' | 'ehrs' | 'prescriptions' | 'addEhr'
  >('demography');
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  return (
    <div className="w-full h-full">
      {notification && <AppNotification notification={notification} />}
      {!isActive && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-display text-on-disabled text-center">
            Encounter Inactive!
          </p>
        </div>
      )}
      {isActive && (
        <div className="w-full space-y-6">
          <div className="w-full inline-flex gap-1 border-b-default border-border-primary">
            <button
              className={`${activeTab === 'demography' ? tabButtonActive : tabButtonNormal}`}
              onClick={() => setActiveTab('demography')}
            >
              Patient Info
            </button>
            <button
              className={`${activeTab === 'ehrs' ? tabButtonActive : tabButtonNormal}`}
              onClick={() => setActiveTab('ehrs')}
            >
              Patient EHRs
            </button>
            <button
              className={`${activeTab === 'prescriptions' ? tabButtonActive : tabButtonNormal}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
            <button
              className={`${activeTab === 'addEhr' ? tabButtonActive : tabButtonNormal}`}
              onClick={() => setActiveTab('addEhr')}
            >
              Create EHR
            </button>
          </div>

          {activeTab === 'demography' && meta.patientData?.demographics && (
            <div className="w-full ">
              {unknownObjectRenderer(
                meta.patientData.demographics,
                `${meta.patientData.demographics.gender === 'Male' ? 'Mr. ' : 'Ms.'}${meta.patientData.demographics.firstName + ' ' + meta.patientData.demographics.lastName}, Age ${calculateAge(new Date(meta.patientData.demographics.birthDate))}`,
              )}
            </div>
          )}

          {activeTab === 'ehrs' && meta.patientData?.demographics && (
            <div className="w-full ">
              <PatientEHRs
                patient={meta.patientData.demographics}
                onNotification={(notification) => setNotification(notification)}
              />
            </div>
          )}

          {activeTab === 'prescriptions' && meta.patientData?.prescriptions && (
            <div className="w-full ">
              <ViewPrescriptions
                prescriptions={meta.patientData.prescriptions}
              />
            </div>
          )}

          {activeTab === 'addEhr' && (
            <div className="w-full ">
              <CreateEHR />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
