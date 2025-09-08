'use client';
import './globals.css';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { NavButton } from '@/components/buttons';
import { AppNotification, Breadcrumb, Divider } from '@/components/misc';
import Image from 'next/image';
import AppLogo from '../../public/AppLogo.png';
import navPaths from '@/approuteConfig';
import { IconUserCircle } from '@/components/icons/icons';
import Login from './login/page';
import { AuthProvider, useAuth } from '_context';
import AppLoader from '@/components/misc/loader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppIcon from '@/components/icons/appIcon';
import { usePathname } from 'next/navigation';
import { SessionProvider } from '_context/_session/sessionContext';
import { AppNotification as AppNotificationType } from '_types/common';
import SessionStatusBar from '@/components/session/sessionStatusBar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionProvider>
              <AppLayout> {children} </AppLayout>
            </SessionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const pathName = usePathname();
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);

  return (
    <>
      {isLoading && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      {!isLoggedIn ? (
        <Login />
      ) : (
        <div className="flex flex-row min-h-screen w-full">
          <div className="flex flex-col justify-between min-h-screen max-h-screen overflow-y-scroll bg-panel-light w-[373px] border-r border-border-primary p-6 drop-shadow-default">
            <div className="width-full mb-6">
              <Image
                src={AppLogo}
                alt="Logo"
                className="w-[200px] mb-6"
                priority={false}
              />
              {navPaths.map(
                (navPath) =>
                  user?.roles.some((role) =>
                    navPath.roles.includes(role, 0),
                  ) && (
                    <NavButton
                      key={navPath.name}
                      navPath={navPath}
                      userRoles={user.roles}
                    />
                  ),
              )}
            </div>
            <div className="w-full flex flex-col items-center gap-6">
              <Link
                href="/account"
                className={`w-full text-default inline-flex items-center gap-2 px-4 py-2 bg-background border-default border-border-primary rounded-large shadow hover:drop-shadow-default ${pathName.includes('/account') ? 'bg-blue-primary text-text-light' : ''}`}
              >
                <AppIcon icon={IconUserCircle} tw="w-[32px] h-[32px]" />
                Good Day, {`${user?.firstName} ${user?.lastName} !`}
              </Link>

              <Divider tw_width="w-full" />
              <p className="text-small text-center">
                &copy; 2025 Shadeer Abdullah
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full min-h-screen max-h-screen overflow-y-scroll p-6">
            {<Breadcrumb navPaths={navPaths} />}
            {user?.doctorProfile && (
              <SessionStatusBar onError={(error) => setNotification(error)} />
            )}
            {children}
          </div>
        </div>
      )}
    </>
  );
}
