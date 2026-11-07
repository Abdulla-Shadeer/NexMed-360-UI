'use client';
import {
  IconBuildingOffice,
  IconClock,
  IconDocumentText,
  IconHeart,
  IconLayers,
  IconUsers,
} from '@/components/icons/icons';
import AppLoader from '@/components/misc/loader';
import DateWiseStats from '@/components/overview/dateWiseStats';
import SingleStatView from '@/components/overview/singleStatView';
import {
  PractitionerRoleOverviewDto,
  OrganizationOverviewDto,
  OverviewDto,
  PatientOverviewDto,
  SystemOverviewDto,
  AppNotificationType,
} from '@/types';
import React, { useState } from 'react';
import useAppQuery from '_hooks/_api/useAppQuery';
import { API_PATHS } from '@/constants';
import { useAuth } from '_context';
import { LineChart } from '@/components/misc';
import AppNotification from '@/components/misc/appNotification';
import { AppointmentsTable } from '@/components/appointments';

export default function Home() {
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<OverviewDto[]>({
    path: API_PATHS.getOverview,
    method: 'GET',
    accessToken: accessToken,
  });
  const [tableError, setTableError] = useState<AppNotificationType | undefined>(
    undefined,
  );

  return (
    <div className="w-full flex flex-col">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {tableError && <AppNotification notification={tableError} />}
      {!isLoading &&
        data &&
        data.map((overview) => {
          switch (overview.name) {
            case 'PractitionerRole':
              const practitionerRoleOverview =
                overview as PractitionerRoleOverviewDto;
              return (
                <PractitionerRoleOverview
                  overview={practitionerRoleOverview}
                  key={overview.name}
                  onError={(err) => setTableError(err)}
                />
              );
            case 'Patient':
              const patientOverview = overview as PatientOverviewDto;
              return (
                <PatientOverview
                  overview={patientOverview}
                  key={overview.name}
                  onError={(err) => setTableError(err)}
                />
              );
            case 'System':
              const systemOverview = overview as SystemOverviewDto;
              return (
                <SystemOverview overview={systemOverview} key={overview.name} />
              );
            case 'Organization':
              const organizationOverview = overview as OrganizationOverviewDto;
              return (
                <OrganizationOverview
                  overview={organizationOverview}
                  key={overview.name}
                  onError={(err) => setTableError(err)}
                />
              );
            default:
              return <></>;
          }
        })}
    </div>
  );
}

function OverviewFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="w-full flex flex-row flex-wrap items-stretch justify-between gap-8 border-default border-border-primary rounded-default p-8 mb-4 bg-background drop-shadow-default">
      <h2 className="w-full text-title bg-panel-light p-2 border-b-default border-border-primary">
        {title}
      </h2>
      {children}
    </div>
  );
}

function PatientOverview({
  overview,
  onError,
}: {
  overview: PatientOverviewDto;
  onError: (error: AppNotificationType) => void;
}) {
  return (
    <OverviewFrame title="Patient Overview">
      <DateWiseStats stats={overview.totalEHRs} name="Total EHRs" />
      <SingleStatView
        data={overview.activePrescriptions}
        name="Active Prescriptions"
        icon={IconDocumentText}
      />
      <SingleStatView
        data={overview.upcomingAppointments}
        name="Upcoming Appointments"
        icon={IconClock}
      />
      {overview.recentAppointments && (
        <AppointmentsTable
          appointments={overview.recentAppointments}
          title="Recent Appointments"
          onError={(error) => error && onError(error)}
        />
      )}
    </OverviewFrame>
  );
}

function PractitionerRoleOverview({
  overview,
  onError,
}: {
  overview: PractitionerRoleOverviewDto;
  onError: (error: AppNotificationType) => void;
}) {
  return (
    <OverviewFrame title="Practitioner Overview">
      <DateWiseStats
        stats={overview.totalPatientsTreated}
        name="Total Patients Treated"
      />
      <SingleStatView
        data={overview.pendingAppointments}
        name="Pending Appointments"
        icon={IconLayers}
      />
      <SingleStatView
        data={overview.upcomingAppointments}
        name="Upcoming Appointments"
        icon={IconClock}
      />
      {overview.recentAppointments && (
        <AppointmentsTable
          appointments={overview.recentAppointments}
          title="Recent Appointments"
          onError={(error) => error && onError(error)}
        />
      )}
    </OverviewFrame>
  );
}

function SystemOverview({ overview }: { overview: SystemOverviewDto }) {
  return (
    <OverviewFrame title="System Overview">
      <SingleStatView
        data={overview.totalEHRs}
        name="Total EHRs"
        icon={IconDocumentText}
      />
      <SingleStatView
        data={overview.totalOrganizations}
        name="Total Organizations"
        icon={IconBuildingOffice}
      />
      <SingleStatView
        data={overview.totalMedicalStaff}
        name="Total Medical Staff"
        icon={IconUsers}
      />
      <SingleStatView
        data={overview.totalPatients}
        name="Total Patients"
        icon={IconHeart}
      />
      <SingleStatView
        data={overview.totalUsers}
        name="Total Users"
        icon={IconUsers}
      />
    </OverviewFrame>
  );
}

function OrganizationOverview({
  overview,
  onError,
}: {
  overview: OrganizationOverviewDto;
  onError: (error: AppNotificationType) => void;
}) {
  return (
    <OverviewFrame title="Organization Overview">
      <DateWiseStats stats={overview.totalPatients} name="Total Patients" />
      <SingleStatView
        data={`${overview.availableBeds.availableCapacity}/${overview.availableBeds.totalCapacity}`}
        name="Available Beds"
        icon={IconHeart}
      />

      {overview.pendingAppointments && (
        <SingleStatView
          data={overview.pendingAppointments}
          name="Pending Appointments"
          icon={IconDocumentText}
        />
      )}

      {overview.staffOnDutyToday && (
        <SingleStatView
          data={`${overview.staffOnDutyToday.availableCapacity}/${overview.staffOnDutyToday.totalCapacity}`}
          name="Staff OnDuty Today"
          icon={IconUsers}
        />
      )}
      {overview.recentAppointments && (
        <AppointmentsTable
          appointments={overview.recentAppointments}
          title="Recent Appointments"
          onError={(error) => error && onError(error)}
        />
      )}
      {overview.patientTrendsOverMonths && (
        <LineChart
          data={overview.patientTrendsOverMonths}
          title="Patient Trends Over Months"
        />
      )}
    </OverviewFrame>
  );
}
