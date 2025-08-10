import { ReactNode } from 'react';

interface FormProps {
  title?: string;
  action: () => void;
  children: ReactNode;
  tw_width?: string;
}
export default function Form({
  title,
  action,
  children,
  tw_width = 'w-full',
}: FormProps) {
  return (
    <form
      action={action}
      className={`${tw_width} h-fit flex flex-row flex-wrap gap-14 items-start border-default border-border-primary rounded-default p-6 drop-shadow-default bg-background`}
    >
      {title && <h2 className="w-full text-title mb-2">{title}</h2>}
      {children}
    </form>
  );
}
