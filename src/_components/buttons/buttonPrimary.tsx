'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconChevronUp, IconChevronDown } from '@/components/icons/icons';
import { useState } from 'react';

enum ButtonVariant {
  Active,
  Highlight,
  None,
  Disabled,
}

interface ButtonPrimaryProps {
  isActive: boolean;
  withIcon?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  buttonText: string;
  withDropdown?: boolean;
  dropdownButtons?: React.ReactElement[];
  disabled?: boolean;
  tw_width?: string;
  onClick: () => void;
}

const getButtonClass = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Active:
      return 'bg-blue-primary text-text-light hover:bg-blue-secondary';
    case ButtonVariant.Highlight:
      return 'bg-background text-text-dark hover:bg-panel-light';
    case ButtonVariant.None:
      return 'border-none bg-transparent text-text-dark hover:bg-panel-light';
    case ButtonVariant.Disabled:
      return 'bg-disabled text-on-disabled cursor-not-allowed';
    default:
      return '';
  }
};

export default function ButtonPrimary({
  isActive = false,
  withIcon = false,
  icon,
  buttonText,
  withDropdown = false,
  dropdownButtons = [],
  disabled = false,
  tw_width = 'w-full',
  onClick,
}: ButtonPrimaryProps) {
  const [open, setOpen] = useState(false);
  const btnVarient = getButtonClass(
    disabled
      ? ButtonVariant.Disabled
      : withDropdown && open
        ? ButtonVariant.Highlight
        : isActive
          ? ButtonVariant.Active
          : ButtonVariant.None,
  );

  const handleClick = () => {
    if (disabled) return;

    if (withDropdown) {
      setOpen((prev) => !prev);
      return;
    }
    onClick();
  };

  return (
    <div className={`relative flex flex-col ${tw_width}`}>
      <button
        type="button"
        className={`w-full flex items-center justify-between px-4 py-3 border-default border-border-primary rounded-large drop-shadow-default cursor-pointer ${btnVarient}`}
        disabled={disabled}
        onClick={handleClick}
      >
        {
          <span className="flex items-center">
            {withIcon && icon && <AppIcon icon={icon} tw="mr-3 inline-block" />}
            <span className="text-left">{buttonText}</span>
          </span>
        }
        {withDropdown && (
          <span>
            <AppIcon icon={open ? IconChevronUp : IconChevronDown} tw="ml-3" />
          </span>
        )}
      </button>
      {withDropdown && open && (
        <div className="flex flex-col w-full bg-transparent pl-10">
          {dropdownButtons && dropdownButtons.length > 0 ? (
            dropdownButtons.map((btn, idx) => (
              <div key={idx} className="border-l border-border-primary">
                {btn}
              </div>
            ))
          ) : (
            <div className="text-on-disabled p-2">No options</div>
          )}
        </div>
      )}
    </div>
  );
}
