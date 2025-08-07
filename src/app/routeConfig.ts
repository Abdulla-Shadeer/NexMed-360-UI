import { NavPath } from '@/app_interfaces';
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

const navPaths: NavPath[] = [
  {
    name: 'Overview',
    path: '/',
    icon: IconHome,
  },
  {
    name: 'Hospital',
    icon: IconBuildingOffice,
    children: [
      {
        name: 'Your Hospital',
        path: '/hospital/view',
        icon: IconHeart,
      },
      {
        name: 'View All',
        path: '/hospital/view-all',
        icon: IconList,
      },
      {
        name: 'Assign Admin',
        path: '/hospital/assign-admin',
        icon: IconShieldCheck,
      },
      {
        name: 'Create Hospital',
        path: '/hospital/create',
        icon: IconPlusCircle,
      },
      {
        name: 'View Members',
        path: '/hospital/view-members',
        icon: IconUsers,
      },
      {
        name: 'Add Members',
        path: '/hospital/add-members',
        icon: IconUserPlus,
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
      },
      {
        name: 'View All',
        icon: IconList,
        path: '/appointments/view-all',
      },
      {
        name: 'Create Appointment',
        icon: IconPlusCircle,
        path: '/appointments/create',
      },
    ],
  },
  {
    name: 'EHR',
    icon: IconDocumentText,
    children: [
      {
        name: 'Your EHRs',
        icon: IconDocumentList,
        path: '/ehr/your-ehrs',
      },
      {
        name: 'View All',
        icon: IconList,
        path: '/ehr/view-all',
      },
      {
        name: 'Create EHR',
        icon: IconPlusCircle,
        path: '/ehr/create',
      },
    ],
  },
  {
    name: 'Settings',
    icon: IconSettings,
    path: '/settings',
  },
];

export default navPaths;
