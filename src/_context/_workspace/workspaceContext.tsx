'use client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppNotificationType } from '@/types';
import { WorkspaceDto, WorkspaceOptionDto } from '_types/access';
import { requestApi } from '_utils/requestApi';
import { useUser } from '../_user/userContext';

interface WorkspaceContextValue {
  workspace?: WorkspaceDto;
  workspaces: WorkspaceOptionDto[];
  workspaceVersion: number;
  isLoading: boolean;
  error?: AppNotificationType;
  hasPermission: (permission: string) => boolean;
  selectWorkspace: (key: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}
const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined,
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useUser();
  // A different login starts with a fresh workspace and no previous selection.
  return (
    <WorkspaceStateProvider key={accessToken ?? ''} token={accessToken}>
      {children}
    </WorkspaceStateProvider>
  );
}

export function WorkspaceStateProvider({
  children,
  token,
}: {
  children: ReactNode;
  token?: string;
}) {
  const [workspaces, setWorkspaces] = useState<WorkspaceOptionDto[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceDto>();
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(!!token);
  const [error, setError] = useState<AppNotificationType>();
  const activeRequest = useRef(0);
  const current = useRef<WorkspaceDto | undefined>(undefined);
  const queryClient = useQueryClient();
  const choices = () =>
    requestApi<WorkspaceOptionDto[]>({
      path: '/Workspace',
      method: 'GET',
      accessToken: token,
    });
  const resolve = (key: string) =>
    requestApi<WorkspaceDto>(
      { path: '/Workspace/Current', method: 'GET', accessToken: token },
      key,
    );
  const showError = (err: unknown) =>
    setError({
      type: 'error',
      title: 'Could not load the workspace',
      description: (err as Error).message,
    });

  async function replaceWorkspace(next: WorkspaceDto | undefined, id: number) {
    if (id !== activeRequest.current) return;
    if (JSON.stringify(current.current) === JSON.stringify(next)) return;
    current.current = undefined;
    setWorkspace(undefined);
    await queryClient.cancelQueries();
    if (id !== activeRequest.current) return;
    queryClient.clear();
    setWorkspaceVersion((value) => value + 1);
    current.current = next;
    setWorkspace(next);
  }

  async function selectWorkspace(key: string) {
    if (!token) return;
    const id = ++activeRequest.current;
    setIsLoading(true);
    setError(undefined);
    try {
      await replaceWorkspace(undefined, id);
      const selected = key ? (await resolve(key)).data : undefined;
      await replaceWorkspace(selected, id);
    } catch (err) {
      if (id === activeRequest.current) showError(err);
    } finally {
      if (id === activeRequest.current) setIsLoading(false);
    }
  }

  async function refreshWorkspaces() {
    if (!token) return;
    const id = ++activeRequest.current;
    const available = (await choices()).data ?? [];
    if (id !== activeRequest.current) return;
    setWorkspaces(available);
    const key = current.current?.key;
    const nextKey = available.some((row) => row.key === key)
      ? key
      : available.length === 1
        ? available[0].key
        : undefined;
    await replaceWorkspace(
      nextKey ? (await resolve(nextKey)).data : undefined,
      id,
    );
    setError(undefined);
  }

  useEffect(() => {
    if (!token) return;
    const id = ++activeRequest.current;
    async function load() {
      try {
        const available = (await choices()).data ?? [];
        if (id !== activeRequest.current) return;
        setWorkspaces(available);
        if (available.length === 1)
          await replaceWorkspace((await resolve(available[0].key)).data, id);
      } catch (err) {
        if (id === activeRequest.current) showError(err);
      } finally {
        if (id === activeRequest.current) setIsLoading(false);
      }
    }
    void load();
    return () => {
      // Ignore responses from requests that outlive this provider.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++activeRequest.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      const id = activeRequest.current;
      const key = current.current?.key;
      try {
        const available = (await choices()).data ?? [];
        if (id !== activeRequest.current) return;
        setWorkspaces(available);
        if (key)
          await replaceWorkspace(
            available.some((row) => row.key === key)
              ? (await resolve(key)).data
              : undefined,
            id,
          );
      } catch {
        await replaceWorkspace(undefined, id);
      } finally {
        refreshing = false;
      }
    }
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    window.addEventListener('workspace-access-changed', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('workspace-access-changed', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        workspaceVersion,
        isLoading,
        error,
        selectWorkspace,
        refreshWorkspaces,
        hasPermission: (permission) =>
          workspace?.permissions.includes(permission) ?? false,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error('Use WorkspaceProvider before reading the workspace.');
  return context;
}
