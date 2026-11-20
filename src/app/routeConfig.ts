import { WorkspaceModes } from '_constants/workspaceModes';
import { NavPath } from '@/types';
import { WorkspaceDto } from '_types/access';
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
  IconShieldCheck,
  IconUserPlus,
  IconUsers,
} from '@/components/icons/icons';

const navPaths: NavPath[] = [
  {
    name: 'Overview',
    path: '/',
    icon: IconHome,
    modes: [
      WorkspaceModes.Patient,
      WorkspaceModes.Work,
      WorkspaceModes.Platform,
    ],
  },
  {
    name: 'Front Office',
    path: '/frontOffice',
    icon: IconComputerDesktop,
    modes: [WorkspaceModes.Work],
    permission: 'appointments.manage-organization',
  },
  {
    name: 'Encounter',
    path: '/encounter',
    icon: IconPlayCircle,
    modes: [WorkspaceModes.Work],
    permission: 'encounters.start',
    assignment: true,
  },
  {
    name: 'Organization',
    icon: IconBuildingOffice,
    modes: [
      WorkspaceModes.Work,
      WorkspaceModes.Patient,
      WorkspaceModes.Platform,
    ],
    children: [
      {
        name: 'Your Organization',
        path: '/organization/your-organization',
        icon: IconHeart,
        modes: [WorkspaceModes.Work],
      },
      {
        name: 'Manage Organization Admins',
        path: '/organization/admins',
        icon: IconShieldCheck,
        modes: [WorkspaceModes.Platform],
      },
      {
        name: 'View All',
        path: '/organization/view-all',
        icon: IconList,
        modes: [WorkspaceModes.Platform, WorkspaceModes.Patient],
      },
      {
        name: 'Add Organization',
        path: '/organization/add',
        icon: IconPlusCircle,
        modes: [WorkspaceModes.Platform],
      },
      {
        name: 'Assign Admin',
        path: '/organization/assign-admin',
        icon: IconShieldCheck,
        modes: [WorkspaceModes.Platform],
      },
      {
        name: 'Manage Staff',
        path: '/organization/view-members',
        icon: IconUsers,
        modes: [WorkspaceModes.Work],
        permission: 'members.manage',
      },
      {
        name: 'Add Staff',
        path: '/organization/add-members',
        icon: IconUserPlus,
        modes: [WorkspaceModes.Work],
        permission: 'members.manage',
      },
      {
        name: 'Locations',
        path: '/organization/locations',
        icon: IconBuildingOffice,
        modes: [WorkspaceModes.Work],
        permission: 'organizations.manage',
      },
      {
        name: 'Access Roles',
        path: '/organization/access-roles',
        icon: IconShieldCheck,
        modes: [WorkspaceModes.Work],
        permission: 'roles.manage',
      },
    ],
  },
  {
    name: 'Sessions',
    icon: IconCalendarDays,
    modes: [WorkspaceModes.Work],
    children: [
      {
        name: 'Create',
        path: '/session/create',
        icon: IconPlusCircle,
        modes: [WorkspaceModes.Work],
        permission: 'schedules.manage-organization',
      },
      {
        name: 'My sessions',
        path: '/session/my',
        icon: IconCalendarDays,
        modes: [WorkspaceModes.Work],
        ownPermission: 'schedules.read-own',
      },
      {
        name: 'Session history',
        path: '/session/history',
        icon: IconClock,
        modes: [WorkspaceModes.Work],
        permission: 'schedules.read-organization,schedules.manage-organization',
        ownPermission: 'schedules.read-own',
      },
      {
        name: 'Organization sessions',
        path: '/session/view',
        icon: IconCalendarDays,
        modes: [WorkspaceModes.Work],
        permission: 'schedules.read-organization,schedules.manage-organization',
      },
    ],
  },
  {
    name: 'Appointments',
    icon: IconClock,
    modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
    children: [
      {
        name: 'My appointments',
        path: '/appointments/your-appointments',
        icon: IconDocumentList,
        modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
        ownPermission: 'appointments.read-own',
      },
      {
        name: 'Organization appointments',
        path: '/appointments/organization-appointments',
        icon: IconList,
        modes: [WorkspaceModes.Work],
        permission:
          'appointments.read-organization,appointments.manage-organization',
      },
      {
        name: 'Create Appointment',
        path: '/appointments/create',
        icon: IconPlusCircle,
        modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
        permission: 'appointments.manage-organization',
      },
    ],
  },
  {
    name: 'Patient',
    icon: IconFace,
    modes: [WorkspaceModes.Work],
    children: [
      {
        name: 'Add New',
        path: '/patient/add',
        icon: IconUserPlus,
        modes: [WorkspaceModes.Work],
        permission: 'patients.register',
      },
      {
        name: 'Patient Care',
        path: '/patient/view',
        icon: IconList,
        modes: [WorkspaceModes.Work],
        permission: 'patients.read',
      },
    ],
  },
  {
    name: 'Medical Records',
    icon: IconDocumentText,
    modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
    children: [
      {
        name: 'Your Records',
        path: '/ehr/your-ehrs',
        icon: IconDocumentList,
        modes: [WorkspaceModes.Patient],
      },
      {
        name: 'Patient Records',
        path: '/ehr/patient-ehrs',
        icon: IconDocumentList,
        modes: [WorkspaceModes.Work],
        permission: 'clinical-records.read',
      },
      {
        name: 'Sharing Requests',
        path: '/ehr/sharing',
        icon: IconShieldCheck,
        modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
        permission: 'clinical-records.read',
      },
      {
        name: 'Create Record',
        path: '/ehr/create',
        icon: IconPlusCircle,
        modes: [WorkspaceModes.Work],
        permission: 'clinical-records.write',
        assignment: true,
      },
    ],
  },
  {
    name: 'Account',
    path: '/account',
    icon: IconUserPlus,
    modes: [
      WorkspaceModes.Patient,
      WorkspaceModes.Work,
      WorkspaceModes.Platform,
    ],
    hidden: true,
  },
];

export function canOpenRoute(
  route: Pick<NavPath, 'modes' | 'permission' | 'ownPermission' | 'assignment'>,
  workspace?: WorkspaceDto,
) {
  const permissions = workspace?.permissions ?? [];
  const canReadOwn =
    !!route.ownPermission &&
    permissions.includes(route.ownPermission) &&
    !!workspace?.practitionerAssignments?.length;
  return (
    !!workspace &&
    route.modes.includes(workspace.mode) &&
    (workspace.mode !== WorkspaceModes.Work ||
      (!route.permission && !route.ownPermission) ||
      route.permission
        ?.split(',')
        .some((permission) => permissions.includes(permission)) ||
      canReadOwn) &&
    (!route.assignment || !!workspace.practitionerRoleId)
  );
}

export function canOpenPath(path: string, workspace?: WorkspaceDto) {
  if (path === '/account' || path === '/account/edit') return true;
  const paths = navPaths.flatMap((row) => row.children ?? [row]);
  const route = paths.find((row) => row.path === path);
  if (route) return canOpenRoute(route, workspace);
  if (path === '/account/edit' || path === '/forbidden' || path === '/login')
    return true;
  if (/^\/organization\/edit\/[^/]+$/.test(path))
    return canOpenRoute(
      {
        modes: [WorkspaceModes.Work, WorkspaceModes.Platform],
        permission: 'organizations.manage',
      },
      workspace,
    );
  if (/^\/organization\/view\/[^/]+$/.test(path)) return !!workspace;
  if (/^\/appointments\/view\/[^/]+$/.test(path))
    return canOpenRoute(
      {
        modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
        permission:
          'appointments.read-organization,appointments.manage-organization',
        ownPermission: 'appointments.read-own',
      },
      workspace,
    );
  if (/^\/ehr\/prescriptions\/view\/[^/]+$/.test(path))
    return canOpenRoute(
      {
        modes: [WorkspaceModes.Patient, WorkspaceModes.Work],
        permission: 'clinical-records.read',
      },
      workspace,
    );
  return true;
}

export default navPaths;
