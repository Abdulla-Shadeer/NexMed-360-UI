import { useEncounter } from '_context/_encounter/encounterContext';
import { useState, useEffect } from 'react';
import { SecondaryButton } from '../buttons';
import QuickActionButton from '../buttons/quickActionButton';
import { TextInput } from '../form';
import { IconStopCircle, IconPlayCircle } from '../icons/icons';
import AppLoader from '../misc/loader';
import { AppNotification } from '@/types';
import DialogWindow from '../popup/dialogWindow';

export default function EncounterStatusBar({
  onNotification,
}: {
  onNotification: (notification: AppNotification | undefined) => void;
}) {
  const {
    startEncounter,
    endEncounter,
    isActive,
    isLoading,
    notification,
    meta,
  } = useEncounter();
  const [showStartPrompt, setShowPrompt] = useState(false);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    onNotification(notification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  return (
    <div
      className={`w-full py-3 px-4 mb-6 border-default border-border-primary rounded-large ${isActive ? 'bg-green-200' : 'bg-disabled'}`}
    >
      {isLoading && <AppLoader />}
      {isActive ? (
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <p>
              Patient:
              {`${meta.patientData?.demographics?.firstName} ${meta.patientData?.demographics?.lastName}`}
            </p>
            <p>Appointment No: {meta.appointmentData?.appointmentNumber}</p>
          </div>
          <QuickActionButton
            text="End Encounter"
            icon={IconStopCircle}
            onClick={endEncounter}
          />
        </div>
      ) : (
        <div className="w-full flex flex-row items-center justify-between">
          <p className="text-title text-on-disabled font-mono">
            Encounter inactive !
          </p>
          <QuickActionButton
            text="Start Encounter"
            icon={IconPlayCircle}
            onClick={() => {
              setShowPrompt(true);
              onNotification(undefined);
            }}
          />
        </div>
      )}

      {showStartPrompt && (
        <DialogWindow
          isOpen={showStartPrompt}
          onClose={() => setShowPrompt(false)}
        >
          <div className="w-full border-default border-border-primary rounded-default flex flex-row flex-wrap items-center gap-4 p-6 bg-background">
            <TextInput
              name="Patient Id"
              value={patientId}
              onChange={(value) => setPatientId(value)}
              error=""
              required
            />
            <SecondaryButton
              type="button"
              buttonText="Start"
              withIcon
              icon={IconPlayCircle}
              onClick={() => {
                if (patientId) {
                  startEncounter(patientId);
                  setShowPrompt(false);
                }
              }}
              initialState="active"
            />
          </div>
        </DialogWindow>
      )}
    </div>
  );
}
