import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import { useForm } from '@tanstack/react-form';
import { useUser } from '_context';
import {
  ViewPractitionerRoleDto,
  SearchPractitionerRoleDto,
  AppNotificationType,
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

export default function PractitionerRoleSearch({
  onPractitionerRoleSelect,
  onError,
}: {
  onPractitionerRoleSelect: (docto?: ViewPractitionerRoleDto) => void;
  onError: (error: AppNotificationType) => void;
}) {
  const [searchDto] = useState<SearchPractitionerRoleDto>({});
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [searchResult, setSearchResult] = useState<
    ViewPractitionerRoleDto[] | undefined
  >(undefined);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const { accessToken } = useUser();
  const [selectedPractitionerRoleId, setSelectedPractitionerRoleId] =
    useState('');

  async function dispatchSearch(data: SearchPractitionerRoleDto) {
    const searchRequest = createQueryFunction<ViewPractitionerRoleDto[]>({
      path: API_PATHS.practitionerRoleSearch,
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
      <Form action={handleSubmit} title="Search PractitionerRole">
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
        <Field name="specialty">
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
              onPractitionerRoleSelect(undefined);
            }}
            withIcon
            icon={IconTrash}
            initialState="light"
          />
        </Subscribe>
      </Form>
      {searchResult && (
        <div className="w-full flex flex-row flex-wrap gap-6 items-stretch max-h-[430px] overflow-auto">
          {searchResult.map((practitionerRole) => (
            <div
              key={practitionerRole.id}
              className={`w-fit bg-background ${selectedPractitionerRoleId === practitionerRole.id ? 'border-green-primary border-2' : 'border-border-primary border-default'} rounded-default flex flex-col gap-2 p-6 justify-between`}
            >
              <p className="text-title-small">
                {practitionerRole.firstName + ' ' + practitionerRole.lastName}
              </p>
              <p className="text-small"> {practitionerRole.specialty} </p>
              <p className="text-black-secondary">
                {practitionerRole.organizationName}
              </p>
              <QuickActionButton
                text={
                  selectedPractitionerRoleId === practitionerRole.id
                    ? 'Selected'
                    : 'Select PractitionerRole'
                }
                onClick={() => {
                  onPractitionerRoleSelect(practitionerRole);
                  setSelectedPractitionerRoleId(practitionerRole.id);
                }}
                icon={
                  selectedPractitionerRoleId === practitionerRole.id
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
