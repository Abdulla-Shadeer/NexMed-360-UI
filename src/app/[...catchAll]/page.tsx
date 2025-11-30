'use client';
import AppIcon from '@/components/icons/appIcon';
import something from '@/appIcons/x-circle.svg';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col gap-10 h-full items-center justify-center">
      <AppIcon
        icon={something}
        tw="w-[64px] h-[64px] stroke-red-primary animate-ping"
      />
      <p className="text-display font-serif text-black-secondary animate-bounce">
        {"Oops! The page you're looking for doesn't exist."}
      </p>
      <a
        onClick={() => router.back()}
        className="text-default text-blue-secondary cursor-pointer hover:underline"
      >
        Go Back
      </a>
    </div>
  );
}
