'use client';
import { InputProps } from '@/types';
import InputWrapper from './inputWrapper';
import { useEffect, useState } from 'react';

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
}: CheckBoxInputProps) {
  const [selections, setSelection] = useState<string[]>(checkedItems ?? []);
  useEffect(() => {
    onChange(selections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections]);

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
                defaultChecked={checkedItems?.includes(item)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelection((prev) =>
                    prev.includes(value)
                      ? prev.filter((v) => v !== value)
                      : [...prev, value],
                  );
                }}
                className="w-4 h-4"
              />
              {item}
            </label>
          );
        })}
      </div>
    </InputWrapper>
  );
}
