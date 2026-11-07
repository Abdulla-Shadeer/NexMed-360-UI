import { NavPath } from '@/types';
import { USER_ROLES } from '@/constants';
import {
  IconBuildingOffice,
  IconCalendarDays,
  IconClock,
  IconComputerDesktop,
  IconDocumentList,
  IconDocumentText,
  IconFace,
  IconHeart,
  IconHome,
  IconList,
  IconPlayCircle,
  IconPlusCircle,
  IconSettings,
  IconShieldCheck,
  IconUserPlus,
  IconUsers,
} from '@/components/icons/icons';

const {
  platformAdmin,
  organizationManager,
  organizationMember,
  practitionerRole,
  patient,
} = USER_ROLES;

const navPaths: NavPath[] = [
  {
    name: 'Overview',
    path: '/',
    icon: IconHome,
    roles: [
      platformAdmin,
      organizationManager,
      organizationMember,
      practitionerRole,
      patient,
    ],
  },
  {
    name: 'Front Office',
    path: '/frontOffice',
    icon: IconComputerDesktop,
    roles: [organizationMember],
  },
  {
    name: 'Encounter',
    path: '/encounter',
    icon: IconPlayCircle,
    roles: [practitionerRole],
  },
  {
    name: 'Organization',
    icon: IconBuildingOffice,
    children: [
      {
        name: 'Your Organization',
        path: '/organization/your-organization',
        icon: IconHeart,
        roles: [organizationManager, organizationMember],
      },
      {
        name: 'View All',
        path: '/organization/view-all',
        icon: IconList,
        roles: [platformAdmin, patient],
      },
      {
        name: 'Add Organization',
        path: '/organization/add',
        icon: IconPlusCircle,
        roles: [platformAdmin],
      },
      {
        name: 'Assign Admin',
        path: '/organization/assign-admin',
        icon: IconShieldCheck,
        roles: [platformAdmin],
      },
      {
        name: 'View Members',
        path: '/organization/view-members',
        icon: IconUsers,
        roles: [organizationManager],
      },
      {
        name: 'Add Members',
        path: '/organization/add-members',
        icon: IconUserPlus,
        roles: [organizationManager],
      },
    ],
    roles: [platformAdmin, organizationManager],
  },
  {
    name: 'Sessions',
    icon: IconCalendarDays,
    roles: [organizationManager, practitionerRole],
    children: [
      {
        name: 'Create',
        path: '/session/create',
        icon: IconPlusCircle,
        roles: [practitionerRole, organizationManager],
      },
      {
        name: 'Your Sessions',
        path: '/session/view',
        icon: IconCalendarDays,
        roles: [practitionerRole, organizationManager],
      },
    ],
  },
  {
    name: 'Appointments',
    icon: IconClock,
    children: [
      {
        name: 'Your Appointments',
        icon: IconDocumentList,
        path: '/appointments/your-appointments',
        roles: [patient, practitionerRole],
      },
      {
        name: 'Organization Appointments',
        icon: IconList,
        path: '/appointments/organization-appointments',
        roles: [organizationMember],
      },
      {
        name: 'Create Appointment',
        icon: IconPlusCircle,
        path: '/appointments/create',
        roles: [patient, organizationMember],
      },
    ],
    roles: [patient, organizationMember, practitionerRole],
  },
  {
    name: 'Patient',
    icon: IconFace,
    children: [
      {
        name: 'Add New',
        icon: IconUserPlus,
        path: '/patient/add',
        roles: [organizationMember],
      },
      {
        name: 'View patient',
        icon: IconList,
        path: '/patient/view',
        roles: [practitionerRole, organizationMember],
      },
    ],
    roles: [organizationMember, practitionerRole],
  },
  {
    name: 'EHR',
    icon: IconDocumentText,
    children: [
      {
        name: 'Your EHRs',
        icon: IconDocumentList,
        path: '/ehr/your-ehrs',
        roles: [patient],
      },
      {
        name: 'Patient EHRs',
        icon: IconDocumentList,
        path: '/ehr/patient-ehrs',
        roles: [practitionerRole],
      },
      {
        name: 'Create EHR',
        icon: IconPlusCircle,
        path: '/ehr/create',
        roles: [practitionerRole],
      },
    ],
    roles: [patient, practitionerRole],
  },
  {
    name: 'Settings',
    icon: IconSettings,
    path: '/settings',
    roles: [platformAdmin],
  },
  {
    name: 'Account',
    icon: IconUserPlus,
    path: '/account',
    roles: [], // to prevent creating nav button, but to allow breadcrumb to work
  },
];

export default navPaths;
