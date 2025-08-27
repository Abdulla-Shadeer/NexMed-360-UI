import { ReactNode } from 'react';

export interface NavPath {
  name: string;
  path?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: string[];
  children?: NavPath[];
}

export interface InputProps {
  name: string;
  description?: string;
  required?: boolean;
  error: string;
  children?: ReactNode;
  tw_width?: string;
  disabled?: boolean;
}

export interface TextInputProps extends InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface TextAreaInputProps extends TextInputProps {
  rows?: number;
}

export interface SelectInputProps extends InputProps {
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export interface DateInputProps extends InputProps {
  pickedDate?: string;
  withTime?: boolean;
  onPick: (value: string) => void;
}

export interface RangeInputProps extends InputProps {
  min: number;
  max: number;
  step?: number;
  value?: number;
  onChange: (value: string) => void;
}

export interface ApiCallParams {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: object;
  accessToken?: string;
}

export interface AppNotification {
  type: 'error' | 'notification' | 'success';
  title?: string;
  description?: string;
  cause?: string;
}

export interface KeyValuePair<K, V> {
  key: K;
  value: V;
}
