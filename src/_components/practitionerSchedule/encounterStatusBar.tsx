import { useEncounter } from '_context/_encounter/encounterContext';
import { useState, useEffect } from 'react';
import { IconStopCircle, IconPlayCircle } from '../icons/icons';
import AppLoader from '../misc/loader';
import { AppNotificationType, ConfirmationDialogContext } from '@/types';
import QuickActionButton from '../buttons/quickActionButton';
import ConfirmationDialog from '../popup/confirmationDialog';

export default function EncounterStatusBar({
  onNotification,
  practitionerScheduleId,
}: {
  onNotification: (notification: AppNotificationType | undefined) => void;
  practitionerScheduleId: string;
}) {
  const {
    startEncounter,
    endEncounter,
    isActive,
    isLoading,
    notification,
    meta,
  } = useEncounter();
  const [confirmationContext, setConfirmationContext] = useState<
    ConfirmationDialogContext | undefined
  >(undefined);

  useEffect(() => {
    onNotification(notification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  return (
    <div
      className={`w-full py-3 px-4 border-default border-border-primary rounded-large ${isActive ? 'bg-green-50 text-green-primary border-green-primary' : 'bg-disabled'}`}
    >
      {isLoading && <AppLoader />}
      {confirmationContext && (
        <ConfirmationDialog
          isOpen={confirmationContext !== undefined}
          message={confirmationContext.message}
          onConfirm={(prompt) => confirmationContext.onConfirm(prompt)}
          onClose={confirmationContext.onClose}
          yesText={confirmationContext.yesText ?? 'Yes'}
          noText={confirmationContext.noText ?? 'No'}
          withPrompt={confirmationContext.withPrompt ?? false}
          promptName={confirmationContext.promptName ?? 'Enter a value'}
          promptRequired={confirmationContext.promptRequired ?? false}
        />
      )}
      {isActive ? (
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <p>
              Patient:
              <span className="font-semibold ml-2">{`${meta.patientData?.demographics?.firstName} ${meta.patientData?.demographics?.lastName}`}</span>
            </p>
            <p>
              Appointment No:{' '}
              <span className="font-semibold ml-2">
                0{meta.appointmentData?.appointmentNumber}
              </span>
            </p>
          </div>
          <QuickActionButton
            text="Finish Encounter"
            icon={IconStopCircle}
            onClick={() =>
              setConfirmationContext({
                message:
                  'Are you sure want to finish encounter for this patient?',
                onConfirm: () => {
                  setConfirmationContext(undefined);
                  endEncounter();
                },
                onClose: () => setConfirmationContext(undefined),
              })
            }
          />
        </div>
      ) : (
        <div className="w-full flex flex-row items-center justify-between">
          <p className="text-title text-on-disabled font-mono">
            Encounter inactive !
          </p>
          <QuickActionButton
            text="Start Encounter"
            onClick={() => {
              setConfirmationContext({
                message: 'Please enter/scan patient ID to start',
                yesText: 'Start',
                noText: 'Cancel',
                withPrompt: true,
                promptName: 'Patient ID',
                promptRequired: true,
                onConfirm: (prompt) => {
                  setConfirmationContext(undefined);
                  startEncounter(practitionerScheduleId, prompt!);
                },
                onClose: () => setConfirmationContext(undefined),
              });
              onNotification(undefined);
            }}
            icon={IconPlayCircle}
          />
        </div>
      )}
    </div>
  );
}
