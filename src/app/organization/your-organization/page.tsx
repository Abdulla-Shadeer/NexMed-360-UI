'use client';
import { useAuth } from '_context';
import { randomUUID } from 'crypto';
import { ViewOrganizationById } from '@/components/organization/viewOrganizationById';

export default function YourOrganization() {
  const { user } = useAuth();
  const organizationId =
    user?.organizationManagerProfile?.organizationId ??
    user?.organizationMemberProfile?.organizationId ??
    randomUUID();

  return <ViewOrganizationById id={organizationId} />;
}
