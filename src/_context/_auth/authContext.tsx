'use client';
import {
  ApiError,
  LoginResponseDto,
  LoginUserDto,
  ViewUserDto,
} from '@/app_interfaces';
import useApiClient from '@/hooks/_api/useApiClient';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContext {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: ViewUserDto | null;
  accessToken: string | null;
  loginUser: (loginUser: LoginUserDto) => void;
  logout: () => void;
  error?: ApiError;
}

const defaultAuthContext: AuthContext = {
  isLoggedIn: false,
  isLoading: false,
  user: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: [],
  },
  accessToken: '',
  loginUser: () => {},
  logout: () => {},
  error: {
    code: '',
    title: '',
    description: '',
    httpStatus: 0,
  },
};

const AuthContext = createContext(defaultAuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<ViewUserDto>(defaultAuthContext.user!);
  const { isLoading, apiResult, error, login, getUserData } = useApiClient();
  const [isGetUserInvoked, setIsGetUserInvoked] = useState(false);

  const accessTokenKey = 'accessToken';

  function loginUser(loginUser: LoginUserDto) {
    login(loginUser);
  }

  function logout() {
    setAccessToken(null);
    setUser(defaultAuthContext.user!);
    localStorage.removeItem(accessTokenKey);
    setIsLoggedIn(false);
    console.log('Auth Context: User logged out');
  }

  useEffect(() => {
    if (!isLoading && (apiResult || error)) {
      if (error) {
        console.log(`Auth Context: Error found: ${error}`);
      } else if (apiResult?.isSuccess) {
        console.log('Auth Context: Api result received with success state:');
        if (Object.hasOwn(apiResult.data!, 'accessToken')) {
          console.log('Auth Context: Received loginUser response');
          const loginResponse = apiResult.data as unknown as LoginResponseDto;
          setAccessToken(loginResponse.accessToken);
          localStorage.setItem(accessTokenKey, loginResponse.accessToken);
          setUser(loginResponse.user);
          setIsLoggedIn(true);
          setIsGetUserInvoked(true);
        } else {
          console.log('Auth Context: Received getUser response');
          const getUserResponse = apiResult.data as unknown as ViewUserDto;
          setUser(getUserResponse);
          setIsLoggedIn(true);
        }
      } else {
        console.log(
          `Auth context: Api result failed: ${JSON.stringify(apiResult?.error)}`,
        );
      }
    }

    if (!isLoggedIn && !isGetUserInvoked) {
      console.log('Auth Context: User not logged in!');
      const token = localStorage.getItem(accessTokenKey);
      if (token) {
        setAccessToken(token);
        console.log('Auth Context: Token found, calling getUser via apiClient');
        getUserData(token);
        setIsGetUserInvoked((prev) => !prev);
      }
    } else {
      console.log('Auth Context: User logged in!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiResult, error, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        accessToken,
        loginUser,
        logout,
        error: apiResult?.error,
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
