'use client';
import { ButtonPrimary } from '@/components/buttons/buttonPrimary';

interface ButtonSecondaryProps {
  initialState: 'active' | 'light';
  withIcon?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  buttonText: string;
  disabled?: boolean;
  tw?: string;
  onClick: () => void;
}

const getLightTheme = () => {
  return 'bg-background text-text-dark border-default border-border-primary rounded-large hover:bg-panel-light';
};

export const ButtonSecondary = ({
  initialState = 'active',
  withIcon = false,
  icon,
  buttonText,
  disabled = false,
  tw = 'w-fit',
  onClick,
}: ButtonSecondaryProps) => {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <ButtonPrimary
      disabled={disabled}
      isActive={initialState === 'active'}
      buttonText={buttonText}
      onClick={handleClick}
      withIcon={withIcon}
      icon={icon}
      tw_width={`${tw} ${initialState === 'light' ? getLightTheme() : ''}`}
    />
  );
};
