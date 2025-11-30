import { ComponentType, SVGProps } from 'react';
import AppIcon from '@/components/icons/appIcon';

interface CapacityViewProps {
  name: string;
  data: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export default function SingleStatView({
  name,
  data,
  icon,
}: CapacityViewProps) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center border-default border-border-primary rounded-default bg-background drop-shadow-default p-4">
      <AppIcon icon={icon} tw="w-[32px] h-[32px]" />
      <h1 className="text-title">{data}</h1>
      <p>{name}</p>
    </div>
  );
}
