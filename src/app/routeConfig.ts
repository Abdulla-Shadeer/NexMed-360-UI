import { NavPath } from '@/app_interfaces';
import { userRoles } from '@/utils';
import {
  IconBuildingOffice,
  IconClock,
  IconDocumentList,
  IconDocumentText,
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
        path: '/hospital/view',
        icon: IconHeart,
        roles: [hospitalAdmin],
      },
      {
        name: 'View All',
        path: '/hospital/view-all',
        icon: IconList,
        roles: [superUser],
      },
      {
        name: 'Assign Admin',
        path: '/hospital/assign-admin',
        icon: IconShieldCheck,
        roles: [superUser],
      },
      {
        name: 'Create Hospital',
        path: '/hospital/create',
        icon: IconPlusCircle,
        roles: [superUser],
      },
      {
        name: 'View Members',
        path: '/hospital/view-members',
        icon: IconUsers,
        roles: [superUser],
      },
      {
        name: 'Add Members',
        path: '/hospital/add-members',
        icon: IconUserPlus,
        roles: [superUser],
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
        name: 'View All',
        icon: IconList,
        path: '/appointments/view-all',
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
];

export default navPaths;
