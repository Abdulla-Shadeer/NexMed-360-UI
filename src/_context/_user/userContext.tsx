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
import { API_PATHS } from '@/constants';
import {
  AppNotificationType,
  LoginResponseDto,
  LoginUserDto,
  ViewUserDto,
} from '@/types';
import { requestApi } from '_utils/requestApi';

interface UserContextValue {
  user?: ViewUserDto;
  accessToken?: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  error?: AppNotificationType;
  loginUser: (dto: LoginUserDto) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}
const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ViewUserDto>();
  const [accessToken, setAccessToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppNotificationType>();
  const requestId = useRef(0);
  const queryClient = useQueryClient();
  const showError = (err: unknown) =>
    setError({
      type: 'error',
      title: 'Could not load the account',
      description: (err as Error).message,
    });

  async function loginUser(dto: LoginUserDto) {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await requestApi<LoginResponseDto>({
        path: API_PATHS.login,
        method: 'POST',
        payload: dto,
      });
      if (id !== requestId.current) return;
      await queryClient.cancelQueries();
      if (id !== requestId.current) return;
      queryClient.clear();
      const account = result.data!;
      localStorage.setItem('accessToken', account.accessToken);
      setUser(account.user);
      setAccessToken(account.accessToken);
    } catch (err) {
      if (id === requestId.current) showError(err);
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }

  function logout() {
    ++requestId.current;
    setAccessToken(undefined);
    setUser(undefined);
    setError(undefined);
    setIsLoading(false);
    localStorage.removeItem('accessToken');
    void queryClient.cancelQueries();
    queryClient.clear();
  }

  async function refetchUser() {
    if (!accessToken) return;
    setError(undefined);
    const id = ++requestId.current;
    try {
      const result = await requestApi<ViewUserDto>({
        path: API_PATHS.getUser,
        method: 'GET',
        accessToken,
      });
      if (id === requestId.current) setUser(result.data);
    } catch (err) {
      if (id === requestId.current) showError(err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    const id = ++requestId.current;
    requestApi<ViewUserDto>({
      path: API_PATHS.getUser,
      method: 'GET',
      accessToken: token,
    })
      .then((result) => {
        if (id === requestId.current) {
          setUser(result.data);
          setAccessToken(token);
        }
      })
      .catch((err) => {
        if (id === requestId.current) {
          localStorage.removeItem('accessToken');
          showError(err);
        }
      })
      .finally(() => {
        if (id === requestId.current) setIsLoading(false);
      });
    return () => {
      // Ignore responses from requests that outlive this provider.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++requestId.current;
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!accessToken,
        isLoading,
        error,
        loginUser,
        logout,
        refetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('Use UserProvider before reading the account.');
  return context;
}
