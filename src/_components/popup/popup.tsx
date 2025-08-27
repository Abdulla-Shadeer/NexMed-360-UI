import { ReactNode, useState } from 'react';
import IconClose from '@/appIcons/x-circle.svg';
import AppIcon from '../icons/appIcon';

interface PopupWindowProps {
  children: ReactNode;
}
export default function PopupWindow({ children }: PopupWindowProps) {
  const [showPopup, setShowPopup] = useState(true);

  return showPopup ? (
    <div className="flex flex-col items-start w-[373px] fixed top-2 right-6 border-default border-border-primary drop-shadow-default bg-panel-light rounded-default p-3 hover:-translate-y-1 transition-transform z-50">
      <a
        onClick={() => setShowPopup(false)}
        className="w-fit pb-2 self-end hover:cursor-pointer hover:text-blue-secondary"
      >
        <AppIcon icon={IconClose} />
      </a>
      {children}
    </div>
  ) : (
    <></>
  );
}
