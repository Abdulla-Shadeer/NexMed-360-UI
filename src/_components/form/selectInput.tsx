'use client';
import { SelectInputProps } from '@/types';
import InputWrapper from './inputWrapper';

export default function SelectInput({
  name,
  description = '',
  required = false,
  error = '',
  options = [],
  selected = '',
  onSelect,
  tw_width,
}: SelectInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <select
        name={name}
        onChange={(e) => onSelect(e.target.value)}
        defaultValue={selected}
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary focus:bg-panel-light"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt, idx) => (
          <option key={opt + idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </InputWrapper>
  );
}
