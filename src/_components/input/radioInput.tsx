import { InputProps } from '@/types';
import InputWrapper from './inputWrapper';

interface RadioInputProps extends InputProps {
  selectItems: string[];
  selectedItem?: string;
  onChange: (value: string) => void;
}

export default function RadioInput({
  name,
  description,
  required,
  error,
  selectItems,
  selectedItem,
  onChange,
  tw_width,
  disabled = false,
}: RadioInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <div className="border-default border-border-primary rounded-default px-3 py-1.5 space-y-2">
        {selectItems.map((item, idx) => {
          return (
            <label
              key={`${item}-${idx}`}
              className="flex flex-row items-center gap-2 hover:bg-panel-light capitalize disabled:hover:cursor-not-allowed disabled:text-black-secondary"
            >
              <input
                type="radio"
                name={name}
                value={item}
                checked={selectedItem === item}
                onChange={(e) => onChange(e.target.value)}
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
