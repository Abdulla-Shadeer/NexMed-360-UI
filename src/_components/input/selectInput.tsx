'use client';
import { KeyValuePair, SelectInputProps } from '@/types';
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
  disabled = false,
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
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary focus:bg-panel-light disabled:hover:cursor-not-allowed disabled:text-black-secondary bg-background"
        disabled={disabled}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.some((opt) => typeof opt === 'string')
          ? options.map((option) => {
              const value = option as string;
              return (
                <option key={value} value={value} className="capitalize">
                  {value}
                </option>
              );
            })
          : options.map((option) => {
              const keyValue = option as KeyValuePair<string, string>;
              return (
                <option
                  key={keyValue.key}
                  value={keyValue.key}
                  className="capitalize"
                >
                  {keyValue.value}
                </option>
              );
            })}
      </select>
    </InputWrapper>
  );
}
