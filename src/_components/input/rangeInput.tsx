import { RangeInputProps } from '@/types';
import InputWrapper from './inputWrapper';
import { useEffect, useState } from 'react';

export default function RangeInput({
  name,
  description,
  required,
  error,
  min,
  max,
  step,
  value,
  onChange,
  tw_width,
  disabled = false,
}: RangeInputProps) {
  const [currentValue, setCurrentValue] = useState(value ?? 0);

  useEffect(() => {
    setCurrentValue(value ?? 0);
  }, [value]);

  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <div className="w-full flex flex-col gap-1.5 border-default border-border-primary rounded-default px-3 py-2">
        <span
          className="inline-block"
          style={{
            marginLeft: `${(currentValue / max) * 100 >= 95 ? 95 : (currentValue / max) * 100}%`,
          }}
        >
          {currentValue}
        </span>
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={(e) => {
            setCurrentValue(Number.parseInt(e.target.value));
            onChange(e.target.value);
          }}
          className="w-full disabled:hover:cursor-not-allowed disabled:text-black-secondary"
          disabled={disabled}
        />
        <div className="flex flex-row items-center justify-between">
          <p>{min}</p>
          <p>{max}</p>
        </div>
      </div>
    </InputWrapper>
  );
}
