import { WorkspaceModes } from '_constants/workspaceModes';

export type WorkspaceMode =
  (typeof WorkspaceModes)[keyof typeof WorkspaceModes];

export interface WorkspaceOptionDto {
  key: string;
  name: string;
  mode: WorkspaceMode;
}

export interface WorkspaceDto extends WorkspaceOptionDto {
  key: string;
  name: string;
  mode: WorkspaceMode;
  organizationId?: string;
  membershipId?: string;
  patientId?: string;
  practitionerRoleId?: string;
  organizationName?: string;
  isLocationRestricted: boolean;
  permissions: string[];
}

export interface AccessRoleDto {
  id: string;
  name: string;
  permissions: string[];
}

export interface MembershipDto {
  id: string;
  userId: string;
  name: string;
  email?: string;
  isActive: boolean;
  locationId?: string;
  accessRoleIds: string[];
}

export interface LocationDto {
  id: string;
  name: string;
}

export interface OrganizationAdministratorDto {
  id: string;
  name: string;
  email?: string;
  isActive: boolean;
  permissions: string[];
}

export interface OrganizationAdministratorsDto {
  organizationId: string;
  organizationName: string;
  administrators: OrganizationAdministratorDto[];
}
