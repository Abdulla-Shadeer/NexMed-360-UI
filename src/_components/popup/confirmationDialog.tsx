'use client';

import { ComponentType, SVGProps, useState } from 'react';
import AppIcon from '../icons/appIcon';
import { IconShieldCheck, IconXCircle } from '../icons/icons';
import DialogWindow from './dialogWindow';
import { TextInput } from '../input';

export default function ConfirmationDialog({
  isOpen,
  message,
  yesText = 'Yes',
  noText = 'No',
  onConfirm,
  onClose,
  withPrompt = false,
  promptName = 'Enter a value',
  promptRequired = false,
}: {
  isOpen: boolean;
  message: string;
  yesText?: string;
  noText?: string;
  onConfirm: (promp?: string) => void;
  onClose: () => void;
  withPrompt?: boolean;
  promptName?: string;
  promptRequired?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  return (
    <DialogWindow isOpen={isOpen} onClose={onClose}>
      <div className="w-full space-y-4">
        <p className="lg:max-w-[373px] md:max-w-[373px] sm:max-w-fit">
          {message}
        </p>
        {withPrompt && (
          <TextInput
            name={promptName}
            required={promptRequired}
            error=""
            value={prompt}
            onChange={(value) => setPrompt(value)}
          />
        )}
        <div className="w-full flex flex-row justify-between">
          <CustomButton
            text={yesText}
            onClick={() => onConfirm(prompt)}
            icon={IconShieldCheck}
            tw="bg-green-primary text-text-light hover:bg-green-primary/80"
            disabled={withPrompt && promptRequired && prompt.length === 0}
          />
          <CustomButton
            text={noText}
            onClick={onClose}
            icon={IconXCircle}
            tw="bg-red-primary text-text-light hover:bg-red-primary/80"
          />
        </div>
      </div>
    </DialogWindow>
  );
}

function CustomButton({
  text,
  onClick,
  tw,
  icon,
  disabled = false,
}: {
  text: string;
  onClick: () => void;
  tw: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}) {
  return (
    <button
      className={`w-fit inline-flex gap-2 px-2 py-1 border-default border-border-primary rounded-default hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled ${tw}`}
      onClick={onClick}
      disabled={disabled}
    >
      <AppIcon icon={icon} /> {text}
    </button>
  );
}
