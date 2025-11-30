'use client';
import { PrimaryButton } from '@/components/buttons';
import { MouseEvent } from 'react';

interface ButtonSecondaryProps {
  type?: 'button' | 'submit' | 'reset' | undefined;
  initialState: 'active' | 'light';
  withIcon?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  buttonText: string;
  disabled?: boolean;
  tw?: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const getLightTheme = () => {
  return 'bg-background text-text-dark border-default border-border-primary rounded-large drop-shadow-default hover:bg-panel-light hover:drop-shadow-none';
};

export default function ButtonSecondary({
  type = 'button',
  initialState = 'active',
  withIcon = false,
  icon,
  buttonText,
  disabled = false,
  tw = 'w-fit h-fit',
  onClick,
}: ButtonSecondaryProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick(e);
  };

  return (
    <PrimaryButton
      type={type}
      disabled={disabled}
      isActive={initialState === 'active'}
      buttonText={buttonText}
      onClick={(e) => handleClick(e)}
      withIcon={withIcon}
      icon={icon}
      tw_width={`${tw} ${initialState === 'light' ? getLightTheme() : ''}`}
    />
  );
}
