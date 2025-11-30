'use client';
import { InputProps } from '@/types';
import InputWrapper from './inputWrapper';

interface CheckBoxInputProps extends InputProps {
  checkItems: string[];
  checkedItems?: string[];
  /* Array of checItems that are checked */
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
        {checkItems.map((item, idx) => {
          return (
            <label
              key={`${item}-${idx}`}
              className="flex flex-row items-center gap-2 hover:bg-panel-light"
            >
              <input
                type="checkbox"
                name={name}
                value={item}
                checked={checkedItems?.includes(item)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (e.target.checked) {
                    onChange([...(checkedItems ?? []), value]);
                  } else {
                    onChange((checkedItems ?? []).filter((v) => v !== value));
                  }
                }}
                className="w-4 h-4"
                disabled={disabled}
              />
              {item}
            </label>
          );
        })}
      </div>
    </InputWrapper>
  );
}
