export interface ApiCallParams {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queries?: Record<string, string>[];
  payload?: object;
  accessToken?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ApiError {
  code: string;
  title?: string;
  description?: string;
  httpStatus: number;
}

export interface ApiResult {
  isSuccess: boolean;
  error?: ApiError;
  data?: ViewUserDto | LoginResponseDto; // need to be replaced by actual response types
}

export interface ViewUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

export interface LoginResponseDto {
  user: ViewUserDto;
  accessToken: string;
}
