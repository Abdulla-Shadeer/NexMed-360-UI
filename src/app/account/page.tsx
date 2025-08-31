'use client';
import AppIcon from '@/components/icons/appIcon';
import { IconEdit, IconLogout } from '@/components/icons/icons';
import { unknownObjectRenderer } from '@/components/misc/unknownObjectRenderer';
import { useAuth } from '_context';
import Link from 'next/link';

export default function Account() {
  const { user, logout } = useAuth();
  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-row items-center justify-between mb-4">
        <Link
          href={'/account/edit'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconEdit} />
          Edit
        </Link>

        <Link
          onNavigate={() => logout()}
          href={'/login'}
          className="text-blue-secondary hover:text-blue-primary py-1 px-2 bg-panel-light rounded-default w-fit flex flex-row items-center gap-2 border-default border-border-primary"
        >
          <AppIcon icon={IconLogout} />
          Logout
        </Link>
      </div>
      {unknownObjectRenderer(user!, 'Account Information')}
    </div>
  );
}
