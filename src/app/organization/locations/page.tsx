'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppQuery, useQueryFunction } from '@/hooks';
import { useUser, useWorkspace } from '_context';
import {
  Form,
  TextInput,
  SelectInput,
  CheckBoxInput,
} from '@/components/input';
import { SecondaryButton } from '@/components/buttons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import ExpandableCard from '@/components/misc/expandableCard';
import { AppNotificationType } from '@/types';

type Location = {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  address?: string;
  isActive: boolean;
};
const empty = {
  name: '',
  type: 'Site',
  parentId: '',
  address: '',
  isActive: true,
};

export default function LocationsPage() {
  const { accessToken } = useUser();
  const { workspace } = useWorkspace();
  const allowed = !workspace?.isLocationRestricted;
  const { data, error, isLoading } = useAppQuery<Location[]>(
    { path: '/Locations', method: 'GET', accessToken },
    allowed,
  );
  const { createQueryFunction, isLoading: saving } = useQueryFunction();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState(empty);
  const [notification, setNotification] = useState<AppNotificationType>();
  function clear() {
    setEditingId(undefined);
    setForm(empty);
  }
  async function save() {
    if (saving) return;
    try {
      await createQueryFunction<Location>({
        path: editingId ? `/Locations/${editingId}` : '/Locations',
        method: editingId ? 'PUT' : 'POST',
        accessToken,
        payload: { ...form, parentId: form.parentId || null },
      })();
      clear();
      setNotification({ type: 'success', title: 'Location saved' });
      await queryClient.invalidateQueries();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Could not save location',
        description: (error as Error).message,
      });
    }
  }
  return (
    <div className="w-full space-y-6">
      <h1 className="text-title">Organization locations</h1>
      {!allowed && (
        <p>
          Choose an unrestricted organization workspace to manage locations.
        </p>
      )}
      {(isLoading || saving) && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {notification && <AppNotification notification={notification} />}
      {allowed && (
        <>
          <fieldset disabled={saving}>
            <Form
              title={editingId ? 'Edit location' : 'Add location'}
              action={save}
            >
              <TextInput
                name="Location name"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                required
                error=""
              />
              <SelectInput
                name="Type"
                selected={form.type}
                onSelect={(type) => setForm({ ...form, type })}
                options={[
                  'Site',
                  'Department',
                  'Ward',
                  'Room',
                  'Bed',
                  'Other',
                ].map((value) => ({ key: value, value }))}
                error=""
              />
              <SelectInput
                name="Parent location"
                selected={form.parentId || 'none'}
                onSelect={(parentId) =>
                  setForm({
                    ...form,
                    parentId: parentId === 'none' ? '' : parentId,
                  })
                }
                options={[
                  { key: 'none', value: 'No parent location' },
                  ...(data ?? [])
                    .filter((row) => row.id !== editingId)
                    .map((row) => ({ key: row.id, value: row.name })),
                ]}
                error=""
              />
              <TextInput
                name="Address"
                value={form.address}
                onChange={(address) => setForm({ ...form, address })}
                error=""
              />
              <CheckBoxInput
                name="Status"
                checkItems={['Active']}
                checkedItems={form.isActive ? ['Active'] : []}
                onChange={(items) =>
                  setForm({ ...form, isActive: items.length > 0 })
                }
                error=""
              />
              <SecondaryButton
                type="submit"
                buttonText="Save location"
                initialState="active"
                disabled={saving || !form.name.trim()}
                onClick={() => {}}
              />
              <SecondaryButton
                buttonText="Clear"
                initialState="light"
                disabled={saving}
                onClick={clear}
              />
            </Form>
          </fieldset>
          {!data?.length && !isLoading && <p>No locations found.</p>}
          <div className="space-y-4">
            {data?.map((row) => (
              <ExpandableCard
                key={row.id}
                title={row.name}
                description={`${row.type} · ${row.isActive ? 'Active' : 'Inactive'}`}
                open={expandedId === row.id}
                onToggle={() =>
                  setExpandedId(expandedId === row.id ? undefined : row.id)
                }
              >
                <p>
                  Parent:{' '}
                  {data.find((parent) => parent.id === row.parentId)?.name ||
                    'None'}
                </p>
                {row.address && <p>{row.address}</p>}
                <SecondaryButton
                  buttonText="Edit"
                  initialState="light"
                  disabled={saving}
                  onClick={() => {
                    setEditingId(row.id);
                    setForm({
                      name: row.name,
                      type: row.type,
                      parentId: row.parentId || '',
                      address: row.address || '',
                      isActive: row.isActive,
                    });
                  }}
                />
              </ExpandableCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
