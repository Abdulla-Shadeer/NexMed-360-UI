export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ApiErrorDto {
  code: string;
  title?: string;
  description?: string;
  httpStatus: number;
}

export interface ApiResultDto {
  isSuccess: boolean;
  error?: ApiErrorDto;
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
