import { ApiError } from '@/app_interfaces';

export default function ApiErrorResult(props: { apiErrorResult: ApiError }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-title text-red-primary">{`${props.apiErrorResult.code} ${props.apiErrorResult.title && ': ' + props.apiErrorResult.title}`}</h3>
      <p className="text-default">{props.apiErrorResult.description}</p>
    </div>
  );
}
