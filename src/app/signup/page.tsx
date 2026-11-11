'use client';

import Link from 'next/link';
import PatientAccessForm from '@/components/patient/patientAccessForm';
import { useUser } from '_context';

export default function SignupPage() {
  const { isLoggedIn } = useUser();
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-panel-light">
      <div className="w-full max-w-3xl space-y-6">
        {isLoggedIn ? (
          <Link href="/account" className="text-blue-secondary">
            Open your account to enable patient access
          </Link>
        ) : (
          <>
            <PatientAccessForm mode="signup" />
            <Link
              href="/login"
              className="text-blue-secondary hover:text-blue-primary"
            >
              Already have an account? Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
