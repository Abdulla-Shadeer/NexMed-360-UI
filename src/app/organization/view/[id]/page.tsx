'use client';

import { ViewOrganizationById } from '@/components/organization/viewOrganizationById';
import { use } from 'react';

export default function ViewOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ViewOrganizationById id={id} />;
}
