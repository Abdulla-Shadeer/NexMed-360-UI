'use client';

import { useState, useRef, useEffect } from 'react';
import AppIcon from '../icons/appIcon';
import { IconEdit, IconMoreVertical, IconTrash } from '../icons/icons';

export default function AddPrescriptionRowActions({
  itemId,
  onAction,
}: {
  itemId: string;
  onAction: (action: 'edit' | 'remove', itemId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMousedownEvent(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleMousedownEvent);
    }

    return () => {
      document.removeEventListener('mousedown', handleMousedownEvent);
    };
  }, [showMenu]);

  return (
    <div className="z-50">
      <a
        onClick={(e) => {
          e.preventDefault();
          setShowMenu((prev) => !prev);
        }}
      >
        <AppIcon icon={IconMoreVertical} tw="hover:cursor-pointer" />
      </a>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute w-fit h-fit p-4 flex flex-col gap-2 bg-panel-light border-default border-border-primary rounded-default drop-shadow-default"
        >
          <button
            className="text-blue-secondary hover:text-blue-primary inline-flex gap-2"
            onClick={() => onAction('edit', itemId)}
          >
            <AppIcon icon={IconEdit} /> Edit
          </button>

          <button
            className="text-blue-secondary hover:text-blue-primary inline-flex gap-2"
            onClick={() => onAction('remove', itemId)}
          >
            <AppIcon icon={IconTrash} /> Remove
          </button>
        </div>
      )}
    </div>
  );
}
