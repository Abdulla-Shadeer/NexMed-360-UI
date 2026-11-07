import { API_PATHS } from '@/constants';
import { useAppQuery } from '@/hooks';
import { KeyValuePair } from '_types/common';
import { ViewOrganizationDto } from '_types/dtos';
import { SelectInput } from '../input';
import { AppNotification } from '../misc';
import AppLoader from '../misc/loader';
import { useAuth } from '_context';

export default function OrganizationSelecter({
  selected,
  onChange,
  fieldError,
}: {
  selected: string | undefined;
  onChange: (value: string) => void;
  fieldError: string;
}) {
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewOrganizationDto[]>({
    path: API_PATHS.getAllOrganizations,
    method: 'GET',
    accessToken,
  });

  return (
    <div>
      {error && <AppNotification notification={error} />}
      {isLoading && <AppLoader />}
      {data && (
        <SelectInput
          name="Select Organization"
          required
          options={data.map((hs) => {
            const option: KeyValuePair<string, string> = {
              key: hs.id,
              value: hs.name,
            };
            return option;
          })}
          selected={selected}
          onSelect={onChange}
          error={fieldError}
        />
      )}
    </div>
  );
}
