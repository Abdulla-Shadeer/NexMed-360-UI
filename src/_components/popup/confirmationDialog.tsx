'use client';

import { ComponentType, SVGProps } from 'react';
import AppIcon from '../icons/appIcon';
import { IconShieldCheck, IconXCircle } from '../icons/icons';
import DialogWindow from './dialogWindow';

export default function ConfirmationDialog({
  isOpen,
  message,
  yesText = 'Yes',
  noText = 'No',
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  yesText?: string;
  noText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <DialogWindow isOpen={isOpen} onClose={onClose}>
      <div className="w-full space-y-4">
        <p>{message}</p>
        <div className="w-full flex flex-row justify-between">
          <CustomButton
            text={yesText}
            onClick={onConfirm}
            icon={IconShieldCheck}
            tw="bg-green-primary text-text-light hover:bg-green-primary/80"
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
}: {
  text: string;
  onClick: () => void;
  tw: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <button
      className={`w-fit inline-flex gap-2 px-2 py-1 border-default border-border-primary rounded-default hover:cursor-pointer ${tw}`}
      onClick={onClick}
    >
      <AppIcon icon={icon} /> {text}
    </button>
  );
}
