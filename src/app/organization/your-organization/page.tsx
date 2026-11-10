'use client';
import { useWorkspace } from '_context/_workspace/workspaceContext';
import { ViewOrganizationById } from '@/components/organization/viewOrganizationById';

export default function YourOrganization() {
  const { workspace } = useWorkspace();
  return workspace?.organizationId ? (
    <ViewOrganizationById id={workspace.organizationId} />
  ) : null;
}
