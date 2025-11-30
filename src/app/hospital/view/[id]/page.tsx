'use client';

import { ViewHospitalById } from '@/components/hospital/viewHospitalById';
import { use } from 'react';

export default function ViewHospitalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ViewHospitalById id={id} />;
}
