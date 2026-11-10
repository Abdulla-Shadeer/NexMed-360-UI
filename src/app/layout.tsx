'use client';
import './globals.css';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { NavButton } from '@/components/buttons';
import { AppNotification, Breadcrumb, Divider } from '@/components/misc';
import Image from 'next/image';
import AppLogo from '../../public/AppLogo.png';
import navPaths, { canOpenPath } from '@/approuteConfig';
import Login from './login/page';
import ForbiddenPage from './forbidden/page';
import {
  UserProvider,
  WorkspaceProvider,
  useUser,
  useWorkspace,
} from '_context';
import AppLoader from '@/components/misc/loader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { EncounterProvider } from '_context/_encounter/encounterContext';
import { AppNotificationType } from '_types/common';
import { FrontOfficeProvider } from '_context/frontOffice/frontOfficeContext';
import WorkspaceSelector from '@/components/organization/workspaceSelector';
import AppIcon from '@/components/icons/appIcon';
import { IconUserCircle } from '@/components/icons/icons';
import { PractitionerScheduleBar } from '@/components/practitionerSchedule/sessionStatusBar';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <WorkspaceProvider>
              <AppLayout>{children}</AppLayout>
            </WorkspaceProvider>
          </UserProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  const {
    isLoggedIn,
    isLoading: userLoading,
    user,
    error: userError,
  } = useUser();
  const {
    workspace,
    workspaceVersion,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace();
  const isLoading = userLoading || workspaceLoading;
  const error = workspaceError ?? userError;
  const pathName = usePathname();
  const [notification, setNotification] = useState<AppNotificationType>();
  useEffect(() => setNotification(undefined), [workspaceVersion]);
  if (isLoading) return <AppLoader />;
  if (!isLoggedIn) return <Login />;
  if (!workspace)
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-panel-light">
        <div className="w-full max-w-2xl space-y-6 border-default border-border-primary rounded-default p-8 bg-background drop-shadow-default">
          <Image src={AppLogo} alt="NexMed360" className="w-64" />
          <h1 className="text-title pb-4 border-b-default border-border-primary">
            Choose your workspace
          </h1>
          <p className="text-default">Choose how you want to use NexMed360.</p>
          {error && <AppNotification notification={error} />}
          <WorkspaceSelector />
        </div>
      </div>
    );
  const allowed = canOpenPath(pathName, workspace);
  return (
    <div className="flex lg:flex-row flex-col lg:flex-nowrap min-h-screen w-full">
      <aside className="flex flex-col justify-between lg:w-[350px] lg:min-w-[350px] lg:min-h-screen lg:max-h-screen overflow-y-auto border-r border-border-primary p-6 bg-panel-light drop-shadow-default">
        <div className="w-full flex flex-col gap-6 mb-6">
          <Image src={AppLogo} alt="NexMed360" />
          <div className="border-default border-border-primary rounded-default p-4 bg-background">
            <WorkspaceSelector />
          </div>
          <nav className="w-full flex flex-col">
            {navPaths
              .filter(
                (row) => !row.hidden && row.modes.includes(workspace.mode),
              )
              .map((row) => (
                <NavButton key={row.name} navPath={row} />
              ))}
          </nav>
        </div>
        <div className="w-full flex flex-col gap-6">
          <Link
            href="/account"
            className={`w-full text-default inline-flex items-center gap-2 px-4 py-2 border-default border-border-primary rounded-large drop-shadow-default ${pathName.startsWith('/account') ? 'bg-blue-primary text-text-light' : 'bg-background'}`}
          >
            <AppIcon icon={IconUserCircle} tw="w-[32px] h-[32px]" />
            {user?.firstName} {user?.lastName}
          </Link>
          <Divider tw_width="w-full" />
          <p className="text-small text-center">NexMed360</p>
        </div>
      </aside>
      <FrontOfficeProvider key={workspaceVersion}>
        <EncounterProvider>
          <main className="flex flex-col w-full min-w-0 min-h-screen lg:max-h-screen overflow-y-auto p-6">
            {error && <AppNotification notification={error} />}
            {notification && <AppNotification notification={notification} />}
            <Breadcrumb navPaths={navPaths} />
            {allowed ? (
              <>
                {workspace.permissions.includes('encounters.start') &&
                  workspace.practitionerRoleId && (
                    <PractitionerScheduleBar
                      practitionerRoleId={workspace.practitionerRoleId}
                      organizationId={workspace.organizationId!}
                      onError={setNotification}
                    />
                  )}
                {children}
              </>
            ) : (
              <ForbiddenPage />
            )}
          </main>
        </EncounterProvider>
      </FrontOfficeProvider>
    </div>
  );
}
