'use client';
import { TextInputProps } from '@/app_interfaces';
import { IconXCircle } from '@/components/icons/icons';
import AppIcon from '@/components/icons/appIcon';

export default function TextInput({
  title,
  description = '',
  required = false,
  error = '',
  placeholder = 'Enter value here..',
  value = '',
  onChange,
  tw_width = '',
}: TextInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${tw_width ? tw_width : 'w-[376px]'}`}>
      <label className="block text-title-small capitalize">
        {title}
        {required && <span className="text-red-primary ml-1">*</span>}
      </label>
      {description && (
        <p className="text-small text-on-disabled">{description}</p>
      )}
      <input
        type="text"
        className="border-default text-default text-text-dark border-border-primary rounded-default px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-primary"
        placeholder={placeholder}
        aria-label="Text input"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
      {error && (
        <p className="text-small text-red-primary text-left">
          <span>
            <AppIcon icon={IconXCircle} tw="inline-block mr-1 w-[16px]" />
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
