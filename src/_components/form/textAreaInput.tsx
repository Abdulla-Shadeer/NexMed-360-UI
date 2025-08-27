import { TextAreaInputProps } from '@/types';
import InputWrapper from './inputWrapper';

export default function TextArea({
  name,
  description,
  required = false,
  error,
  value,
  placeholder = 'Enter text here..',
  onChange,
  tw_width,
  rows = 3,
  disabled = false,
}: TextAreaInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <textarea
        name={name}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary disabled:hover:cursor-not-allowed disabled:text-black-secondary"
        value={value}
        disabled={disabled}
      ></textarea>
    </InputWrapper>
  );
}
