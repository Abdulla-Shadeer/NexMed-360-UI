'use client';
import { ReactNode } from 'react';

export default function ExpandableCard({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="w-full border-default border-border-primary rounded-default bg-background drop-shadow-default">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full p-6 flex flex-wrap items-center justify-between gap-4 text-left hover:bg-panel-light cursor-pointer"
      >
        <span className="min-w-0 break-words space-y-2">
          <span className="block text-title-small">{title}</span>
          <span className="block text-default text-black-secondary">
            {description}
          </span>
        </span>
        <span className="shrink-0">{open ? 'Collapse' : 'Expand'}</span>
      </button>
      {open && (
        <div className="p-6 space-y-3 border-t border-border-primary">
          {children}
        </div>
      )}
    </section>
  );
}
