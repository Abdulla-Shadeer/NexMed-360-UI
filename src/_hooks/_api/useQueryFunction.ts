import { apiPaths, endPointUrl } from '@/constants';
import { ApiResultDto } from '_types/dtos';
import { useState } from 'react';
import status from 'statuses';

export interface ApiRequestOption {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken?: string;
  payload?: object;
  queryParams?: unknown;
}

export default function useQueryFunction() {
  const [isLoading, setIsLoading] = useState(false);

  function createQueryFunction<T>(requestOption: ApiRequestOption) {
    return async function () {
      setIsLoading(true);
      const { path, method, payload, accessToken, queryParams } = requestOption;

      let url = `${endPointUrl + path}`;

      if (queryParams) {
        const keyValues = Object.entries(queryParams);
        keyValues.map((param, idx) => {
          if (idx === 0) {
            url += `?${param[0]}=${param[1]}`;
          } else {
            url += `&${param[0]}=${param[1]}`;
          }
        });
      }

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
        console.info('useQueryFunction => Fetch request completed.');

        if (!(fetchRes.type === 'error') && !(fetchRes.status === 0)) {
          const apiRes = (await fetchRes.json()) as ApiResultDto<T>;
          if (apiRes.isSuccess) {
            setIsLoading(false);
            return apiRes;
          } else {
            setIsLoading(false);
            throw new Error(apiRes.error?.title, {
              cause: apiRes.error?.description,
            });
          }
        } else {
          setIsLoading(false);
          throw new Error('Something went wrong', {
            cause: status(fetchRes.status),
          });
        }
      } catch (err) {
        setIsLoading(false);
        if (err instanceof Error) {
          console.info(
            `useQueryFunction => Message: ${err.message}, Cause: ${err.cause ?? ''}`,
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
