import { Dialog, DialogPanel } from '@headlessui/react';
import { ReactNode } from 'react';
import AppIcon from '../icons/appIcon';
import { IconXCircle } from '../icons/icons';

export default function DialogWindow({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black-secondary/50 backdrop-blur-xs">
        <DialogPanel className="w-fit flex flex-col gap-4 border-default border-border-primary bg-background p-4 rounded-default">
          <div className="w-full">
            <button
              onClick={onClose}
              className="hover:cursor-pointer text-red-primary float-right"
            >
              <AppIcon icon={IconXCircle} />
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
