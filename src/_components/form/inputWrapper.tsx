import { InputProps } from '@/app_interfaces';
import AppIcon from '../icons/appIcon';
import { IconXCircle } from '../icons/icons';

export default function InputWrapper({
  name,
  description,
  required,
  error,
  children,
  tw_width,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-2 ${tw_width ? tw_width : 'w-[376px]'}`}>
      <label className="block text-title-small capitalize">
        {name}
        {required && <span className="text-red-primary ml-1">*</span>}
      </label>
      {description && (
        <p className="text-small text-on-disabled">{description}</p>
      )}
      {children}
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
