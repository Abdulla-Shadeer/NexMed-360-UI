'use client';
import {
  AppNotificationType,
  LoginResponseDto,
  LoginUserDto,
  ViewUserDto,
} from '@/types';
import { useQueryFunction } from '@/hooks';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { API_PATHS } from '@/constants';
import status from 'statuses';

interface AuthContext {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: ViewUserDto | undefined;
  accessToken: string | undefined;
  loginUser: (loginUser: LoginUserDto) => void;
  logout: () => void;
  error: AppNotificationType | undefined;
  refetchUser: () => void;
}

const defaultAuthContext: AuthContext = {
  isLoggedIn: false,
  isLoading: false,
  user: undefined,
  accessToken: undefined,
  loginUser: () => {},
  logout: () => {},
  error: undefined,
  refetchUser: () => {},
};

const AuthContext = createContext(defaultAuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<ViewUserDto | undefined>(undefined);
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [error, setError] = useState<AppNotificationType | undefined>(
    undefined,
  );
  const [hasAutoLoginAttempted, sethasAutoLoginAttempted] = useState(false);

  const accessTokenKey = 'accessToken';

  async function loginUser(loginUser: LoginUserDto) {
    const queryFn = createQueryFunction<LoginResponseDto>({
      path: API_PATHS.login,
      method: 'POST',
      payload: loginUser,
    });
    try {
      setError(undefined);
      const res = await queryFn();
      setUser(res.data?.user);
      setIsLoggedIn(true);
      setAccessToken(res.data?.accessToken);
      localStorage.setItem(accessTokenKey, res.data?.accessToken ?? '');
    } catch (err) {
      setError({
        type: 'error',
        title: 'Login failed!',
        description: (err as Error).message,
        cause: (err as Error).cause ? ((err as Error).cause as string) : '',
      });
    }
  }

  function logout() {
    setAccessToken(undefined);
    setUser(undefined);
    localStorage.removeItem(accessTokenKey);
    setIsLoggedIn(false);
  }

  useEffect(() => {
    if (!hasAutoLoginAttempted) {
      sethasAutoLoginAttempted(true);
      const token = localStorage.getItem(accessTokenKey);
      if (token && !isLoggedIn) {
        getUserData(token);
      }
    }

    async function getUserData(accessToken: string) {
      const queryFn = createQueryFunction<ViewUserDto>({
        path: API_PATHS.getUser,
        method: 'GET',
        accessToken: accessToken,
      });

      try {
        const res = await queryFn();
        setUser(res.data);
        setIsLoggedIn(true);
        setAccessToken(accessToken);
      } catch (err) {
        const _err = err as Error;
        setError({
          type: 'error',
          title: 'Get user failed!',
          description: _err.message,
        });
        if (_err.message === status(401)) {
          // prevent further login attempts with wrong token
          localStorage.removeItem(accessTokenKey);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refetchUser() {
    const fetch = createQueryFunction<ViewUserDto>({
      path: API_PATHS.getUser,
      method: 'GET',
      accessToken,
    });

    try {
      const res = await fetch();
      setUser(res.data);
    } catch (err) {
      const _err = err as Error;
      setError({
        type: 'error',
        title: 'Get user failed!',
        description: _err.message,
        cause: _err.cause ? (_err.cause as string) : '',
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        accessToken,
        loginUser,
        logout,
        error,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth should be used within a AuthContext provider');
  }
  return context;
}

export { AuthProvider, useAuth };
