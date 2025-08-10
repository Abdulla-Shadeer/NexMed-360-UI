'use client';
import './globals.css';
import { useState } from 'react';
import Link from 'next/link';
import { NavButton, SecondaryButton } from '@/components/buttons';
import { Breadcrumb, Divider } from '@/components/misc';
import Image from 'next/image';
import AppLogo from '../../public/AppLogo.png';
import navPaths from '@/approuteConfig';
import { IconLogout } from '@/components/icons/icons';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeBtn, setActiveBtn] = useState<string>('/');

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex flex-row min-h-screen w-full">
          <div className="flex flex-col justify-between min-h-screen max-h-screen overflow-y-scroll bg-panel-light w-[373px] border-r border-border-primary p-6 drop-shadow-default">
            <div className="width-full mb-6">
              <Image
                src={AppLogo}
                alt="Logo"
                className="w-[200px] mb-6"
                priority={false}
              />
              {navPaths.map((navPath) => (
                <NavButton
                  key={navPath.name}
                  navPath={navPath}
                  activeBtn={activeBtn}
                  callback={setActiveBtn}
                />
              ))}
            </div>
            <div className="w-full flex flex-col items-center gap-6">
              <Link href="/login">
                <SecondaryButton
                  initialState="light"
                  buttonText="Logout"
                  withIcon={true}
                  icon={IconLogout}
                  onClick={() => {
                    /* to be implemented */
                  }}
                  tw="w-full"
                />
              </Link>
              <Divider tw_width="w-full" />
              <p className="text-small text-center">
                &copy; 2025 Shadeer Abdullah
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full min-h-screen max-h-screen overflow-y-scroll p-6">
            {<Breadcrumb navPaths={navPaths} callback={setActiveBtn} />}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
