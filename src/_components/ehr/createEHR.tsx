'use client';

import { SecondaryButton } from '@/components/buttons';
import { AddPrescriptionRowAction } from '@/components/ehr';
import CreateEhrForm from '@/components/ehr/createEhrForm';
import CreatePrescription from '@/components/ehr/createPrescriptionForm';
import { IconDocumentCheck, IconTrash } from '@/components/icons/icons';
import { AppNotification } from '@/components/misc';
import AppLoader from '@/components/misc/loader';
import DialogWindow from '@/components/popup/dialogWindow';
import CustomTable from '@/components/table';
import { API_PATHS } from '@/constants';
import { useQueryFunction } from '@/hooks';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useUser, useWorkspace } from '_context';
import {
  EncounterMeta,
  useEncounter,
} from '_context/_encounter/encounterContext';
import { AppNotificationType as AppNotificationType } from '_types/common';
import {
  AddClinicalRecordDto,
  AddPrescriptionDto,
  ViewClinicalRecordDto,
  ViewPatientDto,
} from '_types/dtos';
import { toDefaultDateFormat } from '_utils/dateUtils';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const stepButtonStyle =
  'text-default text-left py-1 px-2 border-border-primary border-default cursor-pointer';

export default function CreateEHR({
  patient,
  onSaved,
  onSavingChange,
}: {
  patient?: ViewPatientDto;
  onSaved?: () => void;
  onSavingChange?: (saving: boolean) => void;
} = {}) {
  const { accessToken } = useUser();
  const { hasPermission, workspace } = useWorkspace();
  const { isActive, isLoading, meta } = useEncounter();
  const [defaultEHR, setDefaultEHR] = useState<AddClinicalRecordDto>({
    patientId: patient?.id ?? '',
    practitionerRoleId: workspace?.practitionerRoleId ?? '',
    diagnosis: '',
    visitDate: toDefaultDateFormat(new Date()),
  });
  const [defaultPrescription] = useState<AddPrescriptionDto>({
    medicineName: '',
    dosage: '',
    timesPerDay: 0,
    isLongTermUse: false,
  });
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<
    AddPrescriptionDto | undefined
  >(undefined);
  const [isPrescriptionEditOpen, setIsPrescriptionEditOpen] = useState(false);
  const [step, setStep] = useState<'Create EHR' | 'Create Prescriptions'>(
    'Create EHR',
  );
  const [EHR, setEHR] = useState<AddClinicalRecordDto | undefined>(undefined);
  const [notification, setNotification] = useState<
    AppNotificationType | undefined
  >(undefined);
  const { createQueryFunction } = useQueryFunction();
  const [isAddingEhr, setIsAddingEhr] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const queryClient = useQueryClient();

  async function createEHR(data = EHR) {
    if (!data || isAddingEhr) return;
    const create = createQueryFunction<ViewClinicalRecordDto>({
      path: API_PATHS.addClinicalRecord,
      method: 'POST',
      accessToken,
      payload: {
        ...data,
        patientId: patient?.id ?? data.patientId,
        practitionerRoleId: workspace?.practitionerRoleId,
      },
    });

    try {
      setNotification(undefined);
      setIsAddingEhr(true);
      onSavingChange?.(true);

      const res = await create();
      setNotification({
        type: 'success',
        title: 'Clinical record saved',
        cause: `EHR Reference: ${res.data?.id}`,
      });
      setEHR(undefined);
      setStep('Create EHR');
      setFormVersion((value) => value + 1);
      await queryClient.invalidateQueries({
        queryKey: [
          {
            path: API_PATHS.getClinicalRecords(patient?.id ?? data.patientId),
            method: 'GET',
            accessToken,
          },
          workspace?.key,
        ],
      });
      onSaved?.();
    } catch (error) {
      const err = error as Error;
      setNotification({
        type: 'error',
        title: 'Could not save the clinical record',
        description: err.message,
        cause: err.cause ? (err.cause as string) : undefined,
      });
    } finally {
      setIsAddingEhr(false);
      onSavingChange?.(false);
    }
  }

  useEffect(() => {
    if (patient) return;
    setEHR(undefined);
    setStep('Create EHR');
    if (isActive) {
      setDefaultEHR((prev) => ({
        ...prev!,
        patientId:
          meta.patientData?.demographics?.id ??
          meta.appointmentData?.patientId ??
          '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isActive,
    patient?.id,
    meta.patientData?.demographics?.id,
    meta.appointmentData?.patientId,
  ]);

  return (
    <fieldset
      disabled={isAddingEhr}
      className="w-full flex flex-row gap-[2%] flex-wrap lg:flex-nowrap space-y-6"
    >
      {((!patient && isLoading) || isAddingEhr) && <AppLoader />}
      {notification && <AppNotification notification={notification} />}
      <DialogWindow
        isOpen={isPrescriptionEditOpen}
        onClose={() => {
          setIsPrescriptionEditOpen(false);
          setPrescriptionToEdit(undefined);
        }}
      >
        <CreatePrescription
          defaultData={prescriptionToEdit ?? defaultPrescription}
          onFormSubmit={(data) => {
            // Replace the edited prescription in the current draft.
            setEHR((prev) => ({
              ...prev!,
              prescriptions: prev?.prescriptions
                ?.filter((pr) => pr.medicineName !== data.medicineName)
                .concat([data]),
            }));
            setPrescriptionToEdit(undefined);
            setIsPrescriptionEditOpen(false);
          }}
        />
      </DialogWindow>
      {/* Left panel*/}
      <EhrInfo
        ehr={EHR}
        encounterMeta={patient ? {} : meta}
        patient={patient}
        onReset={() => {
          setEHR(undefined);
          setStep('Create EHR');
          setNotification(undefined);
          setFormVersion((value) => value + 1);
        }}
        onConfirm={() => createEHR()}
      />
      {/* Right panel */}
      <div className="lg:w-[74%] md:w-full sm:w-full bg-background flex flex-col gap-6">
        <div className="flex flex-row items-center gap-1">
          <div
            className={`${stepButtonStyle} ${step === 'Create EHR' ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
          >
            01. Create EHR
          </div>
          <div
            className={`${stepButtonStyle} ${step === 'Create Prescriptions' ? 'bg-panel-light text-blue-secondary' : 'bg-disabled text-on-disabled'}`}
          >
            02. Add Prescriptions
          </div>
        </div>
        {step === 'Create EHR' ? (
          <CreateEhrForm
            key={`${defaultEHR.patientId}-${formVersion}`}
            defaultData={defaultEHR}
            onFormSubmit={(data) => {
              setEHR(data);
              setStep('Create Prescriptions');
            }}
            onSave={(data) => createEHR(data)}
          />
        ) : (
          // Review the prescriptions before saving the clinical record.
          <div className="space-y-6">
            {EHR?.prescriptions && (
              <PrescriptionsTable
                prescriptions={EHR.prescriptions}
                onAction={(action, medicineName) => {
                  switch (action) {
                    case 'edit':
                      const toEdit = EHR.prescriptions?.find(
                        (pr) => pr.medicineName === medicineName,
                      );
                      setPrescriptionToEdit(toEdit as AddPrescriptionDto);
                      setIsPrescriptionEditOpen(true);
                      break;
                    case 'remove':
                      setEHR((prev) => ({
                        ...prev!,
                        prescriptions: prev?.prescriptions?.filter(
                          (pr) => pr.medicineName !== medicineName,
                        ),
                      }));
                      break;
                  }
                }}
              />
            )}

            {!hasPermission('prescriptions.issue') && (
              <p>
                Adding prescriptions is disabled. You need permission to issue
                prescriptions.
              </p>
            )}
            <fieldset
              disabled={!hasPermission('prescriptions.issue')}
              className={
                !hasPermission('prescriptions.issue') ? 'opacity-50' : ''
              }
            >
              <CreatePrescription
                defaultData={defaultPrescription}
                onFormSubmit={(data) => {
                  setEHR((prev) => ({
                    ...prev!,
                    prescriptions: prev?.prescriptions
                      ? prev?.prescriptions?.concat([data])
                      : [data],
                  }));
                }}
              />
            </fieldset>
          </div>
        )}
      </div>
    </fieldset>
  );
}

function PrescriptionsTable({
  prescriptions,
  onAction,
}: {
  prescriptions: AddPrescriptionDto[];
  onAction: (action: 'edit' | 'remove', medicineName: string) => void;
}) {
  const columnHelper = createColumnHelper<AddPrescriptionDto>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('medicineName', {
        header: 'Medicine',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('dosage', {
        header: 'Dosage',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('timesPerDay', {
        header: 'Times per Day',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('duration', {
        header: 'Duration',
        cell: (info) =>
          info.row.original.isLongTermUse ? 'Long Term Use' : info.getValue(),
      }),
      columnHelper.display({
        header: 'Action',
        cell: (info) => (
          <AddPrescriptionRowAction
            itemId={info.row.original.medicineName}
            onAction={onAction}
          />
        ),
      }),
    ],
    [onAction, columnHelper],
  );

  const table = useReactTable({
    columns,
    data: prescriptions,
    getCoreRowModel: getCoreRowModel(),
  });

  return <CustomTable tableData={table} title="Prescriptions" />;
}

function EhrInfo({
  ehr,
  encounterMeta,
  patient,
  onConfirm,
  onReset,
}: {
  ehr?: AddClinicalRecordDto;
  encounterMeta: EncounterMeta;
  patient?: ViewPatientDto;
  onReset: () => void;
  onConfirm: () => void;
}) {
  const { user } = useUser();
  const { workspace } = useWorkspace();
  return (
    <div className="lg:w-[24%] md:w-fit sm:w-fit h-fit p-6 bg-panel-light border-default border-border-primary rounded-default flex flex-col gap-4 text-default text-black-secondary justify-between">
      <p className="text-title-small pb-1 border-b-default border-border-primary text-blue-secondary">
        EHR Details
      </p>
      <p>
        Patient:
        {patient ? (
          <span className="font-semibold ml-1">
            {patient.firstName} {patient.lastName}
          </span>
        ) : encounterMeta.appointmentData && encounterMeta.patientData ? (
          <span className="font-semibold ml-1">{` ${encounterMeta.patientData.demographics?.gender === 'Male' ? 'Mr.' : 'Ms.'} ${encounterMeta.appointmentData.patientName}`}</span>
        ) : ehr?.patientId ? (
          <span className="font-semibold ml-1">{ehr.patientId}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Practitioner:
        {workspace?.practitionerRoleId ? (
          <span className="font-semibold ml-1">{` ${user?.firstName} ${user?.lastName}`}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Organization:
        {encounterMeta.appointmentData ? (
          <span className="font-semibold ml-1">
            {encounterMeta.appointmentData.organizationName}
          </span>
        ) : (
          <span className="font-semibold ml-1">
            {workspace?.organizationName ?? '~'}
          </span>
        )}
      </p>
      <p>
        Diagnosis:
        {ehr?.diagnosis ? (
          <span className="font-semibold ml-1">{ehr.diagnosis}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Notes:
        {ehr?.practitionerNotes ? (
          <span className="font-semibold ml-1">{ehr.practitionerNotes}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        FollowUp Date:
        {ehr?.followUpDate ? (
          <span className="font-semibold ml-1">{ehr.followUpDate}</span>
        ) : (
          <span>~</span>
        )}
      </p>
      <p>
        Prescriptions Added:
        {ehr?.prescriptions ? (
          <span className="font-semibold ml-1">{ehr.prescriptions.length}</span>
        ) : (
          <span className="font-semibold ml-1">0</span>
        )}
      </p>
      <div className="inline-flex flex-wrap gap-2 mt-12">
        <SecondaryButton
          buttonText="Confirm"
          onClick={onConfirm}
          withIcon
          icon={IconDocumentCheck}
          initialState="active"
          tw="w-full"
          disabled={!(ehr?.patientId && ehr.diagnosis && ehr.visitDate)}
        />
        <SecondaryButton
          buttonText="Reset"
          onClick={onReset}
          withIcon
          icon={IconTrash}
          initialState="light"
          tw="w-full"
        />
      </div>
    </div>
  );
}
