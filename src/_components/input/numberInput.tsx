import { InputProps } from '@/types';
import InputWrapper from './inputWrapper';

interface NumberInputProps extends InputProps {
  value?: number;
  onChange: (value: number) => void;
}

export default function NumberInput({
  name,
  description,
  value,
  required,
  error,
  onChange,
  tw_width,
  disabled = false,
}: NumberInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <input
        type="number"
        name={name}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value))}
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary disabled:hover:cursor-not-allowed disabled:text-black-secondary bg-background"
        disabled={disabled}
      />
    </InputWrapper>
  );
}
