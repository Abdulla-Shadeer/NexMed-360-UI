import { ReactNode } from 'react';

interface FormProps {
  title?: string;
  action: () => void;
  children: ReactNode;
  tw?: string;
}
export default function Form({
  title,
  action,
  children,
  tw = 'w-full',
}: FormProps) {
  return (
    <form
      action={action}
      className={`h-fit space-y-12 border-default border-border-primary rounded-default p-6 drop-shadow-default bg-background ${tw}`}
    >
      {title && <h2 className="w-full text-title mb-2">{title}</h2>}
      {children}
    </form>
  );
}
