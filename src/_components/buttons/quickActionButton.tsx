import { ComponentType, SVGProps } from 'react';
import AppIcon from '../icons/appIcon';

export default function QuickActionButton({
  text,
  onClick,
  icon,
  isDisabled = false,
}: {
  text: string;
  onClick: () => void;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isDisabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary cursor-pointer disabled:text-on-disabled disabled:hover:text-on-disabled disabled:cursor-not-allowed"
      disabled={isDisabled}
    >
      <AppIcon icon={icon} />
      {text}
    </button>
  );
}
