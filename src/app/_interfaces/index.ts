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

interface TextAreaInputProps extends TextInputProps {
  rows?: number;
}

interface SelectInputProps extends InputProps {
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

interface DateInputProps extends InputProps {
  pickedDate?: string;
  withTime?: boolean;
  onPick: (value: string) => void;
}

interface RangeInputProps extends InputProps {
  min: number;
  max: number;
  step?: number;
  value?: number;
  onChange: (value: string) => void;
}

export type {
  NavPath,
  InputProps,
  TextInputProps,
  SelectInputProps,
  TextAreaInputProps,
  DateInputProps,
  RangeInputProps,
};
