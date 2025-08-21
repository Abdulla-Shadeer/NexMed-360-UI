import { AppError as AppErrorType } from '@/types';

export default function AppError(props: { appError: AppErrorType }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-title text-red-primary">{`${props.appError.title}`}</h3>
      <p className="text-default">{props.appError.description}</p>
      <code className="text-default">{props.appError.cause}</code>
    </div>
  );
}
