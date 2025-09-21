import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '_context';
import {
  ViewDoctorDto,
  SearchDoctorDto,
  AppNotification as AppNotificationType,
} from '@/types';
import { useState } from 'react';
import { SecondaryButton } from '../buttons';
import QuickActionButton from '../buttons/quickActionButton';
import { Form, TextInput } from '../input';
import {
  IconSearch,
  IconTrash,
  IconCheckCircle,
  IconPlusCircle,
} from '../icons/icons';
import AppLoader from '../misc/loader';

export default function DoctorSearch({
  onDoctorSelect,
  onError,
}: {
  onDoctorSelect: (docto?: ViewDoctorDto) => void;
  onError: (error: AppNotificationType) => void;
}) {
  const [searchDto] = useState<SearchDoctorDto>({});
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [searchResult, setSearchResult] = useState<ViewDoctorDto[] | undefined>(
    undefined,
  );
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const { accessToken } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  async function dispatchSearch(data: SearchDoctorDto) {
    const searchRequest = createQueryFunction<ViewDoctorDto[]>({
      path: API_PATHS.doctorSearch,
      method: 'POST',
      accessToken,
      payload: data,
    });

    try {
      setSearchResult((await searchRequest()).data);
    } catch (error) {
      const err = error as Error;
      onError({
        type: 'error',
        title: 'Search Failed!',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    }
  }

  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: searchDto,
    onSubmit: ({ value }) => {
      if (value === searchDto) {
        setInputError('*Please specify a minimum of one search criteria');
        return;
      }
      setInputError(undefined);
      dispatchSearch(value);
    },
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {isLoading && <AppLoader />}
      {inputError && <p className="w-full text-red-primary">{inputError}</p>}
      <Form action={handleSubmit} title="Search Doctor">
        <Field name="name">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>
        <Field name="email">
          {(field) => (
            <TextInput
              type="email"
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>
        <Field name="speciality">
          {(field) => (
            <TextInput
              name={field.name}
              value={field.state.value ?? ''}
              onChange={field.handleChange}
              error=""
              tw_width="w-fit"
            />
          )}
        </Field>
        <Subscribe>
          <SecondaryButton
            buttonText="Search"
            type="submit"
            onClick={() => {}}
            withIcon
            icon={IconSearch}
            initialState="active"
          />
          <SecondaryButton
            buttonText="Clear"
            type="button"
            onClick={() => {
              reset(searchDto);
              setInputError(undefined);
              setSearchResult(undefined);
              onDoctorSelect(undefined);
            }}
            withIcon
            icon={IconTrash}
            initialState="light"
          />
        </Subscribe>
      </Form>
      {searchResult && (
        <div className="w-full flex flex-row flex-wrap gap-6 items-stretch max-h-[430px] overflow-auto">
          {searchResult.map((doctor) => (
            <div
              key={doctor.id}
              className={`w-fit bg-background ${selectedDoctorId === doctor.id ? 'border-green-primary border-2' : 'border-border-primary border-default'} rounded-default flex flex-col gap-2 p-6 justify-between`}
            >
              <p className="text-title-small">
                Dr. {doctor.firstName + ' ' + doctor.lastName}
              </p>
              <p className="text-small"> {doctor.speciality} </p>
              <p className="text-black-secondary">{doctor.hospitalName}</p>
              <QuickActionButton
                text={
                  selectedDoctorId === doctor.id ? 'Selected' : 'Select Doctor'
                }
                onClick={() => {
                  onDoctorSelect(doctor);
                  setSelectedDoctorId(doctor.id);
                }}
                icon={
                  selectedDoctorId === doctor.id
                    ? IconCheckCircle
                    : IconPlusCircle
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
