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
import RecentAppointments from '@/components/overview/recentAppointments/recentAppointments';
import SingleStatView from '@/components/overview/singleStatView';
import {
  DoctorOverviewDto,
  HospitalOverviewDto,
  OverviewDto,
  PatientOverviewDto,
  SystemOverviewDto,
} from '_types/dtos';
import React from 'react';
import useAppQuery from '_hooks/_api/useAppQuery';
import { apiPaths } from '@/constants';
import { useAuth } from '_context';
import { LineChart } from '@/components/misc';
import AppNotification from '@/components/misc/appNotification';

export default function Home() {
  const { accessToken } = useAuth();
  const { data, error, isLoading } = useAppQuery<OverviewDto[]>({
    path: apiPaths.getOverview,
    method: 'GET',
    accessToken: accessToken,
  });

  return (
    <div className="w-full flex flex-col">
      {isLoading && <AppLoader />}
      {error && <AppNotification notification={error} />}
      {!isLoading &&
        data &&
        data.map((overview) => {
          switch (overview.name) {
            case 'Doctor':
              const doctorOverview = overview as DoctorOverviewDto;
              return (
                <DoctorOverview overview={doctorOverview} key={overview.name} />
              );
            case 'Patient':
              const patientOverview = overview as PatientOverviewDto;
              return (
                <PatientOverview
                  overview={patientOverview}
                  key={overview.name}
                />
              );
            case 'System':
              const systemOverview = overview as SystemOverviewDto;
              return (
                <SystemOverview overview={systemOverview} key={overview.name} />
              );
            case 'Hospital':
              const hospitalOverview = overview as HospitalOverviewDto;
              return (
                <HospitalOverview
                  overview={hospitalOverview}
                  key={overview.name}
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

function PatientOverview({ overview }: { overview: PatientOverviewDto }) {
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
        <RecentAppointments appointments={overview.recentAppointments} />
      )}
    </OverviewFrame>
  );
}

function DoctorOverview({ overview }: { overview: DoctorOverviewDto }) {
  return (
    <OverviewFrame title="Doctor Overview">
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
        <RecentAppointments appointments={overview.recentAppointments} />
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
        data={overview.totalHospitals}
        name="Total Hospitals"
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

function HospitalOverview({ overview }: { overview: HospitalOverviewDto }) {
  return (
    <OverviewFrame title="Hospital Overview">
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
        <RecentAppointments appointments={overview.recentAppointments} />
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
