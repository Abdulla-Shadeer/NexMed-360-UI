import InputWrapper from './inputWrapper';
import { TimeInputProps } from '_types/common';

export default function TimeInput({
  name,
  description,
  required,
  error,
  pickedTime,
  onPick,
  tw_width,
  disabled = false,
}: TimeInputProps) {
  return (
    <InputWrapper
      name={name}
      description={description}
      required={required}
      error={error}
      tw_width={tw_width}
    >
      <input
        type="time"
        defaultValue={pickedTime}
        onChange={(e) => onPick(e.target.value)}
        className="border-default border-border-primary rounded-default px-3 py-2 text-default focus:outline-none focus:ring-1 focus:ring-blue-primary focus:bg-panel-light active:bg-panel-light bg-background"
        disabled={disabled}
      />
    </InputWrapper>
  );
}
