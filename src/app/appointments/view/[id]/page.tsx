'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';

export default function ViewAppointment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const returnPath = useSearchParams().get('returnPath');

  return (
    <>
      <p>{id}</p>
      <Link href={returnPath ?? '/'}> Go back </Link>
    </>
  );
}
