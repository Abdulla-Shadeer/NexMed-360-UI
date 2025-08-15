import { ReactNode } from 'react';
import IconClose from '@/appIcons/x-circle.svg';
import AppIcon from '../icons/appIcon';

interface PopupWindowProps {
  children: ReactNode;
  onClose: () => void;
}
export default function PopupWindow({ children, onClose }: PopupWindowProps) {
  return (
    <div className="flex flex-col items-start w-[373px] fixed top-2 right-2 border-default border-border-primary drop-shadow-default bg-panel-light rounded-default p-3 hover:-translate-y-1 transition-transform">
      <a
        onClick={onClose}
        className="w-fit pb-2 self-end hover:cursor-pointer hover:text-blue-secondary"
      >
        <AppIcon icon={IconClose} />
      </a>
      {children}
    </div>
  );
}
