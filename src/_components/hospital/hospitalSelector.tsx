import { apiPaths } from '@/constants';
import { useAppQuery } from '@/hooks';
import { KeyValuePair } from '_types/common';
import { ViewHospitalDto } from '_types/dtos';
import { SelectInput } from '../form';
import { AppNotification } from '../misc';
import AppLoader from '../misc/loader';
import { useAuth } from '_context';

export default function HospitalSelecter({
  selected,
  onChange,
  fieldError,
}: {
  selected: string | undefined;
  onChange: (value: string) => void;
  fieldError: string;
}) {
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<ViewHospitalDto[]>({
    path: apiPaths.getAllHospitals,
    method: 'GET',
    accessToken,
  });

  return (
    <div>
      {error && <AppNotification notification={error} />}
      {isLoading && <AppLoader />}
      {data && (
        <SelectInput
          name="Select Hospital"
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
