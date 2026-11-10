import { WorkspaceModes } from '_constants/workspaceModes';
import { ViewPatientDto } from '@/types';
import { useUser } from '_context/_user/userContext';
import { useWorkspace } from '_context/_workspace/workspaceContext';
import useAppQuery from './useAppQuery';

export default function useOwnPatient() {
  const { accessToken } = useUser();
  const { workspace } = useWorkspace();
  return useAppQuery<ViewPatientDto>(
    { path: '/Patient/Me', method: 'GET', accessToken },
    workspace?.mode === WorkspaceModes.Patient,
  );
}
