import { ApiCallParams, ApiResultDto, LoginUserDto } from '@/types';
import { apiPaths } from '@/utils';
import { useState } from 'react';

/*
A custom hook that define available endpoints and methods from the API. this hook can be used as a HTTP API client library.
*/
export function useApiClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResultDto | null>(null);
  const [error, setError] = useState<unknown>(null);

  // need to be passed via a config file or env variable
  const endPointUrl = 'https://localhost:7143/api/v1';

  async function callApi({
    path,
    method,
    payload,
    accessToken,
  }: ApiCallParams) {
    const url = `${endPointUrl + path}`;
    const body = payload ? JSON.stringify(payload) : null;
    const request = new Request(url, {
      method: method,
      body: body,
    });
    request.headers.set('Content-Type', 'application/json');
    if (path !== apiPaths.login) {
      request.headers.append('Authorization', `Bearer ${accessToken}`);
    }

    const result = await fetch(request)
      .then(async (value) => await value.json())
      .catch((error) => {
        console.log(`Api Client: Error: ${JSON.stringify(error)}`);
        setError(error);
      })
      .finally(() => {
        console.log('Api Client: Request completed');
        setIsLoading((prev) => !prev);
      });

    if (result.data || result.error) {
      setApiResult(result);
    } else {
      setError(JSON.stringify(result));
    }
  }

  function login(loginUser: LoginUserDto) {
    console.log('Api Client: Initiating login request..');
    setIsLoading((prev) => !prev);
    callApi({ path: apiPaths.login, method: 'POST', payload: loginUser });
  }

  function getUserData(accessToken: string) {
    console.log('Api Client: Initiating getUser request..');
    setIsLoading((prev) => !prev);
    callApi({
      path: apiPaths.getUser,
      method: 'GET',
      accessToken: accessToken,
    });
  }

  return { isLoading, apiResult, error, login, getUserData };
}
