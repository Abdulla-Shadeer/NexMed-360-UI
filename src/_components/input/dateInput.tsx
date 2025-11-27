import { DateInputProps } from '@/types';
import InputWrapper from './inputWrapper';

export default function DateInput({
  name,
  description,
  required,
  error,
  pickedDate,
  withTime,
  onPick,
  tw_width,
  disabled = false,
}: DateInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <input
        type={withTime ? 'datetime-local' : 'date'}
        value={pickedDate}
        onChange={(e) => onPick(e.target.value)}
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary focus:bg-panel-light active:bg-panel-light bg-background"
        disabled={disabled}
      />
    </InputWrapper>
  );
}
