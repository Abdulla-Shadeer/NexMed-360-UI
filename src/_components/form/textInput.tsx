'use client';
import { TextInputProps } from '@/types';
import InputWrapper from './inputWrapper';

export default function TextInput({
  name,
  description = '',
  required = false,
  error = '',
  placeholder = 'Enter value here..',
  value = '',
  onChange,
  tw_width = '',
}: TextInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <input
        type="text"
        className="border-default text-default border-border-primary rounded-default px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-primary"
        placeholder={placeholder}
        aria-label="Text input"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </InputWrapper>
  );
}
