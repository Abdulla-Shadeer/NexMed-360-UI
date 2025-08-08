import { ReactNode } from 'react';

interface NavPath {
  name: string;
  path?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavPath[];
}

interface InputProps {
  name: string;
  description?: string;
  required?: boolean;
  error: string;
  children?: ReactNode;
  tw_width?: string;
}

interface TextInputProps extends InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

interface SelectInputProps extends InputProps {
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export type { NavPath, InputProps, TextInputProps, SelectInputProps };
