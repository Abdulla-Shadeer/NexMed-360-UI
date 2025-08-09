import { ReactNode } from 'react';

interface FormProps {
  action: () => void;
  children: ReactNode;
  tw_width?: string;
}
export default function Form({
  action,
  children,
  tw_width = 'w-full',
}: FormProps) {
  return (
    <form
      action={action}
      className={`${tw_width} h-fit flex flex-row flex-wrap gap-14 items-end border-default border-border-primary rounded-default p-6 drop-shadow-default bg-background`}
    >
      {children}
    </form>
  );
}
