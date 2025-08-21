import { apiPaths, endPointUrl } from '@/constants';
import { KeyValuePair } from '@/types';
import { ApiResultDto } from '_types/dtos';
import { useState } from 'react';
import status from 'statuses';

export interface ApiRequestOption {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken?: string;
  payload?: object;
  queryParams?: KeyValuePair<string, string | number>[];
}

export default function useQueryFunction() {
  const [isLoading, setIsLoading] = useState(false);

  function createQueryFunction<T>(requestOption: ApiRequestOption) {
    return async function () {
      setIsLoading(true);
      const { path, method, payload, accessToken, queryParams } = requestOption;

      let url = `${endPointUrl + path}`;

      if (queryParams) {
        queryParams.map((param, idx) => {
          if (idx === 0) {
            url += `?${param.key}=${param.value}`;
          } else {
            url += `&${param.key}=${param.value}`;
          }
        });
      }
      console.log(`useQueryFunction => Request URL: ${url}`);

      const body = payload ? JSON.stringify(payload) : null;
      const request = new Request(url, {
        method: method as string,
        body: body,
      });
      request.headers.set('Content-Type', 'application/json');
      if ((path as string) !== apiPaths.login) {
        request.headers.append('Authorization', `Bearer ${accessToken}`);
      }

      try {
        console.info('useQueryFunction => Invoking fetch request..');
        const fetchRes = await fetch(request);
        if (fetchRes.ok) {
          setIsLoading(false);
          return (await fetchRes.json()) as ApiResultDto<T>;
        } else {
          setIsLoading(false);
          throw new Error(`${status(fetchRes.status)}`);
        }
      } catch (err) {
        setIsLoading(false);
        if (err instanceof Error) {
          console.info(
            `useQueryFunction => Something went wrong: ${err.message}`,
          );
          throw err;
        }
        console.info(
          `useQueryFunction => Something went wrong: ${err as string}`,
        );
        throw new Error(err as string);
      }
    };
  }

  return { createQueryFunction, isLoading };
}
