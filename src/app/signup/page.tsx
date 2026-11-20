'use client';

import Link from 'next/link';
import Image from 'next/image';
import AppLogo from '../../../public/AppLogo.png';
import PatientAccessForm from '@/components/patient/patientAccessForm';
import { useUser } from '_context';

export default function SignupPage() {
  const { isLoggedIn } = useUser();
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-panel-light">
      <div className="w-full max-w-4xl space-y-6 p-8 bg-background border-default border-border-primary rounded-default drop-shadow-default">
        <Image src={AppLogo} alt="NexMed360" className="w-64" />
        {isLoggedIn ? (
          <Link href="/account" className="text-blue-secondary">
            Open your account to enable patient access
          </Link>
        ) : (
          <>
            <PatientAccessForm mode="signup" />
          </>
        )}
      </div>
    </main>
  );
}
