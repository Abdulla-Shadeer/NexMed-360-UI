import { NavPath } from '@/types';
import { userRoles } from '@/constants';
import {
  IconBuildingOffice,
  IconClock,
  IconDocumentList,
  IconDocumentText,
  IconFace,
  IconHeart,
  IconHome,
  IconList,
  IconPlusCircle,
  IconSettings,
  IconShieldCheck,
  IconUserPlus,
  IconUsers,
} from '@/components/icons/icons';

const { superUser, hospitalAdmin, receptionist, doctor, patient } = userRoles;

const navPaths: NavPath[] = [
  {
    name: 'Overview',
    path: '/',
    icon: IconHome,
    roles: [superUser, hospitalAdmin, receptionist, doctor, patient],
  },
  {
    name: 'Hospital',
    icon: IconBuildingOffice,
    children: [
      {
        name: 'Your Hospital',
        path: '/hospital/your-hospital',
        icon: IconHeart,
        roles: [hospitalAdmin, receptionist],
      },
      {
        name: 'View All',
        path: '/hospital/view-all',
        icon: IconList,
        roles: [superUser, patient],
      },
      {
        name: 'Add Hospital',
        path: '/hospital/add',
        icon: IconPlusCircle,
        roles: [superUser],
      },
      {
        name: 'Assign Admin',
        path: '/hospital/assign-admin',
        icon: IconShieldCheck,
        roles: [superUser],
      },
      {
        name: 'View Members',
        path: '/hospital/view-members',
        icon: IconUsers,
        roles: [hospitalAdmin],
      },
      {
        name: 'Add Members',
        path: '/hospital/add-members',
        icon: IconUserPlus,
        roles: [hospitalAdmin],
      },
    ],
    roles: [superUser, hospitalAdmin],
  },
  {
    name: 'Appointments',
    icon: IconClock,
    children: [
      {
        name: 'Your Appointments',
        icon: IconDocumentList,
        path: '/appointments/your-appointments',
        roles: [patient, doctor],
      },
      {
        name: 'Hospital Appointments',
        icon: IconList,
        path: '/appointments/hospital-appointments',
        roles: [receptionist],
      },
      {
        name: 'Create Appointment',
        icon: IconPlusCircle,
        path: '/appointments/create',
        roles: [patient, receptionist],
      },
    ],
    roles: [patient, receptionist, doctor],
  },
  {
    name: 'Patient',
    icon: IconFace,
    children: [
      {
        name: 'Add New',
        icon: IconUserPlus,
        path: '/patient/add',
        roles: [receptionist],
      },
      {
        name: 'View patient',
        icon: IconList,
        path: '/patient/view',
        roles: [doctor, receptionist],
      },
    ],
    roles: [receptionist, doctor],
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
        name: 'View All',
        icon: IconList,
        path: '/ehr/view-all',
        roles: [doctor],
      },
      {
        name: 'Create EHR',
        icon: IconPlusCircle,
        path: '/ehr/create',
        roles: [doctor],
      },
    ],
    roles: [patient, doctor],
  },
  {
    name: 'Settings',
    icon: IconSettings,
    path: '/settings',
    roles: [superUser],
  },
  {
    name: 'Account',
    icon: IconUserPlus,
    path: '/account',
    roles: [], // to prevent creating nav button, but to allow breadcrumb to work
  },
];

export default navPaths;
