'use client';

import { CreateEHR } from '@/components/ehr';
import PatientEHRs from '@/components/ehr/patientEhrs';
import ViewPrescriptions from '@/components/ehr/viewPrescriptions';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { useWorkspace } from '_context';
import { useEncounter } from '_context/_encounter/encounterContext';
import { calculateAge } from '_utils/dateUtils';
import { useState } from 'react';

const tabButton =
  'hover:cursor-pointer px-6 py-2 border-default border-border-primary rounded-t-default disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled';
const tabButtonNormal = `${tabButton} bg-panel-light text-blue-secondary hover:text-blue-primary`;
const tabButtonActive = `${tabButton} bg-blue-secondary text-text-light hover:bg-blue-primary`;

export default function EncounterPage() {
  const { isActive, meta } = useEncounter();

  const { hasPermission } = useWorkspace();
  const [activeTab, setActiveTab] = useState<
    'demography' | 'ehrs' | 'prescriptions' | 'addEhr'
  >('demography');

  return (
    <div className="w-full h-full">
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
              disabled={!hasPermission('patients.read')}
              title={
                !hasPermission('patients.read')
                  ? 'You do not have permission for this action.'
                  : undefined
              }
              onClick={() => setActiveTab('demography')}
            >
              Patient Info
            </button>
            <button
              className={`${activeTab === 'ehrs' ? tabButtonActive : tabButtonNormal}`}
              disabled={!hasPermission('clinical-records.read')}
              title={
                !hasPermission('clinical-records.read')
                  ? 'You do not have permission for this action.'
                  : undefined
              }
              onClick={() => setActiveTab('ehrs')}
            >
              Patient EHRs
            </button>
            <button
              className={`${activeTab === 'prescriptions' ? tabButtonActive : tabButtonNormal}`}
              disabled={!hasPermission('clinical-records.read')}
              title={
                !hasPermission('clinical-records.read')
                  ? 'You do not have permission for this action.'
                  : undefined
              }
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
            <button
              className={`${activeTab === 'addEhr' ? tabButtonActive : tabButtonNormal}`}
              disabled={!hasPermission('clinical-records.write')}
              title={
                !hasPermission('clinical-records.write')
                  ? 'You do not have permission for this action.'
                  : undefined
              }
              onClick={() => setActiveTab('addEhr')}
            >
              Create EHR
            </button>
          </div>
          <p>
            Disabled actions need additional permission from your organization
            administrator.
          </p>

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
              <PatientEHRs patient={meta.patientData.demographics} />
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
