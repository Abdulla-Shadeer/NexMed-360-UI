'use client';
import { InputProps, KeyValuePair } from '@/types';
import InputWrapper from './inputWrapper';

interface CheckBoxInputProps extends InputProps {
  checkItems: string[] | KeyValuePair<string, string>[];
  disabledItems?: string[];
  checkedItems?: string[];
  onChange: (value: string[]) => void;
}

export default function CheckBoxInput({
  name,
  description,
  required,
  error,
  checkItems,
  checkedItems,
  onChange,
  tw_width,
  disabled = false,
  disabledItems = [],
}: CheckBoxInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <div className="border-default border-border-primary rounded-default px-3 py-1.5 space-y-2">
        {checkItems.map((item) => {
          const value = typeof item === 'string' ? item : item.key;
          const label = typeof item === 'string' ? item : item.value;
          const isDisabled = disabled || disabledItems.includes(value);
          return (
            <label
              key={value}
              className={`flex flex-row items-start gap-2 rounded-default px-1 py-1 ${isDisabled ? 'text-on-disabled cursor-not-allowed' : 'hover:bg-panel-light cursor-pointer'}`}
            >
              <input
                type="checkbox"
                name={name}
                value={value}
                checked={checkedItems?.includes(value) ?? false}
                onChange={(e) => {
                  const value = e.target.value;
                  if (e.target.checked) {
                    onChange([...(checkedItems ?? []), value]);
                  } else {
                    onChange((checkedItems ?? []).filter((v) => v !== value));
                  }
                }}
                className="w-4 h-4 mt-1 shrink-0 accent-blue-primary disabled:cursor-not-allowed"
                disabled={isDisabled}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </InputWrapper>
  );
}
