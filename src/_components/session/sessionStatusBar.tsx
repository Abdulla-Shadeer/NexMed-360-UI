import { useSession } from '_context/_session/sessionContext';
import { useState, useEffect } from 'react';
import { SecondaryButton } from '../buttons';
import QuickActionButton from '../buttons/quickActionButton';
import { TextInput } from '../form';
import { IconStopCircle, IconPlayCircle } from '../icons/icons';
import AppLoader from '../misc/loader';
import { AppNotification } from '@/types';
import DialogWindow from '../popup/dialogWindow';

export default function SessionStatusBar({
  onError,
}: {
  onError: (error: AppNotification | undefined) => void;
}) {
  const { startSession, endSession, isActive, isLoading, error, meta } =
    useSession();
  const [showStartPrompt, setShowPrompt] = useState(false);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    if (error) {
      onError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div
      className={`w-full py-3 px-4 mb-6 border-default border-border-primary rounded-large ${isActive ? 'bg-green-200' : 'bg-disabled'}`}
    >
      {isLoading && <AppLoader />}
      {isActive ? (
        <div className="w-full flex flex-row items-center justify-between">
          <p>
            Patient:{' '}
            {`${meta.patientInfo.demographics.firstName} ${meta.patientInfo.demographics.lastName}`}
          </p>
          <QuickActionButton
            text="End Session"
            icon={IconStopCircle}
            onClick={endSession}
          />
        </div>
      ) : (
        <div className="w-full flex flex-row items-center justify-between">
          <p className="text-title text-on-disabled font-mono">
            Session inactive !
          </p>
          <QuickActionButton
            text="Start Session"
            icon={IconPlayCircle}
            onClick={() => {
              setShowPrompt(true);
              onError(undefined);
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
                  startSession(patientId);
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
