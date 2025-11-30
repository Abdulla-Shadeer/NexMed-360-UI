'use client';
import { useAuth } from '_context';
import { randomUUID } from 'crypto';
import { ViewHospitalById } from '@/components/hospital/viewHospitalById';

export default function YourHospital() {
  const { user } = useAuth();
  const hospitalId =
    user?.hospitalAdminProfile?.hospitalId ??
    user?.receptionistProfile?.hospitalId ??
    randomUUID();

  return <ViewHospitalById id={hospitalId} />;
}
