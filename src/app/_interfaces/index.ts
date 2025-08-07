interface NavPath {
  name: string;
  path?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavPath[];
}

interface InputProps {
  title: string;
  description?: string;
  required?: boolean;
  errors?: InputValidationError[];
  tw_width?: string;
}

interface TextInputProps extends InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

type InputValidationError = {
  name: string;
  error: string;
};

export type { NavPath, InputProps, TextInputProps, InputValidationError };
