import { ReactNode } from 'react';

interface FormProps {
  title?: string;
  action: () => void;
  children: ReactNode;
  direction?: 'row' | 'col';
}
export default function Form({
  title,
  action,
  children,
  direction = 'row',
}: FormProps) {
  return (
    <form
      action={action}
      className={`h-fit border-default border-border-primary rounded-default p-6 drop-shadow-default bg-background ${direction === 'row' ? 'w-full flex flex-row flex-wrap gap-12' : 'w-fit space-y-12'}`}
    >
      {title && (
        <h2 className="w-full text-title pb-6 border-b-default border-border-primary">
          {title}
        </h2>
      )}
      {children}
    </form>
  );
}
