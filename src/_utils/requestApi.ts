import { API_ENDPOINT } from '@/constants';
import { ApiResultDto } from '_types/dtos';

export interface ApiRequestOption {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken?: string;
  payload?: object;
  queryParams?: unknown;
}

export async function requestApi<T>(
  options: ApiRequestOption,
  workspaceKey?: string,
  signal?: AbortSignal,
): Promise<ApiResultDto<T>> {
  const url = new URL(API_ENDPOINT + options.path);
  if (options.queryParams) {
    for (const [key, value] of Object.entries(options.queryParams)) {
      if (value !== undefined && value !== null)
        url.searchParams.set(key, String(value));
    }
  }
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (workspaceKey) headers.set('X-Workspace', workspaceKey);
  if (options.accessToken)
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  const response = await fetch(
    new Request(url, {
      method: options.method,
      headers,
      signal,
      body: options.payload ? JSON.stringify(options.payload) : undefined,
    }),
  );
  if (response.status === 403 && !signal?.aborted) {
    window.dispatchEvent(new Event('workspace-access-changed'));
  }
  const body = await response.text();
  let result: ApiResultDto<T> | undefined;
  try {
    result = body ? JSON.parse(body) : undefined;
  } catch {
    /* Some server errors have no JSON body. */
  }
  if (response.ok && result?.isSuccess === true) return result;
  const message =
    result?.error?.description ??
    result?.error?.title ??
    (response.status === 401
      ? 'Please log in again.'
      : response.status === 403
        ? 'You do not have access in this workspace.'
        : 'Could not complete the request. Please try again.');
  throw new Error(message);
}
