'use client';
import {
  AppNotification,
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
import { apiPaths } from '@/constants';
import status from 'statuses';

interface AuthContext {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: ViewUserDto | undefined;
  accessToken: string | undefined;
  loginUser: (loginUser: LoginUserDto) => void;
  logout: () => void;
  error: AppNotification | undefined;
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
  const [error, setError] = useState<AppNotification | undefined>(undefined);
  const [hasAutoLoginAttempted, sethasAutoLoginAttempted] = useState(false);

  const accessTokenKey = 'accessToken';

  async function loginUser(loginUser: LoginUserDto) {
    const queryFn = createQueryFunction<LoginResponseDto>({
      path: apiPaths.login,
      method: 'POST',
      payload: loginUser,
    });
    try {
      console.log('Auth context => executing login request..');
      const res = await queryFn();
      console.log('Auth context => result received.');
      setUser(res.data?.user);
      setIsLoggedIn(true);
      setAccessToken(res.data?.accessToken);
      localStorage.setItem(accessTokenKey, res.data?.accessToken ?? '');
    } catch (err) {
      setError({
        type: 'error',
        title: 'Login failed!',
        description: (err as Error).message,
      });
    }
  }

  function logout() {
    setAccessToken(undefined);
    setUser(undefined);
    localStorage.removeItem(accessTokenKey);
    setIsLoggedIn(false);
    console.log('Auth Context: User logged out');
  }

  useEffect(() => {
    console.log('Auth context => Renders...');
    if (!hasAutoLoginAttempted) {
      console.log('Auth context => Auto login has attempted..');
      sethasAutoLoginAttempted(true);
      const token = localStorage.getItem(accessTokenKey);
      if (token && !isLoggedIn) {
        console.log(
          'Auth context => Token found and user not logged in, calling getUser..',
        );
        getUserData(token);
      } else {
        console.log('No token found or already logged in!');
      }
    }

    async function getUserData(accessToken: string) {
      const queryFn = createQueryFunction<ViewUserDto>({
        path: apiPaths.getUser,
        method: 'GET',
        accessToken: accessToken,
      });

      try {
        console.log('Auth context => executing get user request..');
        const res = await queryFn();
        console.log('Auth context => result received.');
        setUser(res.data);
        setIsLoggedIn(true);
        setAccessToken(accessToken);
      } catch (err) {
        const _err = err as Error;
        console.log(`Auth context => Error get user: ${_err.message}`);
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
      path: apiPaths.getUser,
      method: 'GET',
      accessToken,
    });

    try {
      console.log('Auth context => Refetching user data...');
      const res = await fetch();
      setUser(res.data);
    } catch (err) {
      const _err = err as Error;
      console.log(`Auth context => Error get user: ${_err.message}`);
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
