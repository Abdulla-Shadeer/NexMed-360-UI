import { AppNotificationType } from '@/types';
import AppIcon from '../icons/appIcon';
import { IconBell, IconCheckCircle, IconXCircle } from '../icons/icons';
import PopupWindow from '../popup/popup';

export default function AppNotification({
  notification,
}: {
  notification: AppNotificationType;
}) {
  const { type, title, description, cause } = notification;
  return (
    <PopupWindow>
      <div className="flex flex-col gap-2">
        {title && (
          <h3
            className={`text-title ${type === 'success' ? 'text-green-primary' : type === 'error' ? 'text-red-primary' : ''} flex flex-row items-center`}
          >
            <AppIcon
              icon={
                type === 'success'
                  ? IconCheckCircle
                  : type === 'error'
                    ? IconXCircle
                    : IconBell
              }
              tw={`${type === 'success' ? 'stroke-green-primary' : type === 'error' ? 'stroke-red-primary' : ''} inline-block pr-2 w-[32px] h-[32px]`}
            />
            {title}
          </h3>
        )}
        {description && <p className="text-default">{description}</p>}
        {cause && <code className="text-default">{cause}</code>}
      </div>
    </PopupWindow>
  );
}
