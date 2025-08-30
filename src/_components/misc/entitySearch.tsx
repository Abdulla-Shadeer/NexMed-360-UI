import { useState } from 'react';
import { SelectInput, TextInput } from '../form';
import AppIcon from '../icons/appIcon';
import { IconChevronUpdown, IconSearch, IconTrash } from '../icons/icons';
import ButtonSecondary from '../buttons/buttonSecondary';
import { useQueryFunction } from '@/hooks';
import { apiPaths } from '@/constants';
import { useAuth } from '_context';
import { AppNotification as AppNotificationType } from '_types/common';
import AppNotification from './appNotification';
import AppLoader from './loader';
import { unknownObjectRenderer } from './unknownObjectRenderer';

interface EntitySearchDto {
  entity: 'patient' | 'doctor' | 'hospital';
  inputType: 'name' | 'email';
  input: string;
}
const defaultDto: EntitySearchDto = {
  entity: 'hospital',
  inputType: 'name',
  input: '',
};

export default function EntitySearch({ open = true }: { open?: boolean }) {
  const [searchDto, setSearchDto] = useState<EntitySearchDto>(defaultDto);
  const [isOpen, setIsOpen] = useState(open);
  const { accessToken } = useAuth();
  const { createQueryFunction, isLoading } = useQueryFunction();
  const [error, setError] = useState<AppNotificationType | undefined>(
    undefined,
  );
  const [searchResult, setSearchResult] = useState<unknown | undefined>(
    undefined,
  );

  const handleEntityChange = (value: string) => {
    const entity = value as 'patient' | 'doctor' | 'hospital';
    setSearchDto({
      entity,
      inputType: 'name',
      input: '',
    });
  };

  const handleInputTypeChange = (value: string) => {
    setSearchDto((prev) => ({
      ...prev,
      inputType: value as 'name' | 'email',
      input: '',
    }));
  };

  const handleInputChange = (value: string) => {
    setSearchDto((prev) => ({
      ...prev,
      input: value,
    }));
  };

  async function handleSearch() {
    setError(undefined);
    const searchRequest = createQueryFunction<object>({
      path: apiPaths.entitySearch,
      method: 'POST',
      accessToken,
      payload: searchDto,
    });

    try {
      const res = await searchRequest();
      console.log(`Entity Search => Search Completed: ${JSON.stringify(res)}`);
      setSearchResult(res.data);
    } catch (error) {
      const err = error as Error;
      console.log(`Entity Search => Search Error: ${JSON.stringify(err)}`);
      setError({
        type: 'error',
        title: 'Search failed',
        description: err.message,
        cause: (err.cause as string) ?? '',
      });
    }
  }

  function handleClear() {
    setSearchDto(defaultDto);
    setSearchResult(undefined);
  }

  return (
    <>
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      <div className="w-full flex flex-col p-4 mb-6 border-default border-border-primary rounded-default bg-panel-light drop-shadow-default">
        <div className="flex flex-row items-center justify-between w-full">
          <h2 className="w-full text-title flex flex-row items-center">
            <AppIcon icon={IconSearch} tw="inline-block mr-2" /> Search
          </h2>
          <a
            onClick={() => setIsOpen((prev) => !prev)}
            className="hover:cursor-pointer"
          >
            <AppIcon
              icon={IconChevronUpdown}
              tw="hover:stroke-blue-secondary"
            />
          </a>
        </div>
        {isOpen && (
          <>
            <div className="w-full flex flex-row flex-wrap gap-8 items-center p-4 bg-background border-2 border-dashed border-border-primary rounded-default mt-3 drop-shadow-default">
              <SelectInput
                name="Serach Entity"
                options={['patient', 'doctor', 'hospital']}
                required
                error=""
                onSelect={handleEntityChange}
                selected={searchDto.entity}
                tw_width="w-fit"
              />

              <SelectInput
                name="Input Type"
                options={
                  searchDto.entity === 'hospital' ? ['name'] : ['name', 'email']
                }
                required
                error=""
                onSelect={handleInputTypeChange}
                selected={searchDto.inputType}
                tw_width="w-fit"
              />

              <TextInput
                name={`Type ${searchDto.inputType}`}
                required
                value={searchDto.input}
                onChange={handleInputChange}
                error=""
              />

              <ButtonSecondary
                buttonText="Search"
                initialState="active"
                onClick={handleSearch}
                withIcon
                icon={IconSearch}
                disabled={!searchDto.input}
              />
              <ButtonSecondary
                buttonText="Clear"
                initialState="light"
                onClick={handleClear}
                withIcon
                icon={IconTrash}
              />
            </div>
            <div>
              {searchResult ? (
                unknownObjectRenderer(searchResult)
              ) : (
                <p className="text-disabled pt-4">No Results Found!</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
