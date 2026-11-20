export interface RecordSharingRequestDto {
  id: string;
  patientId: string;
  patientName: string;
  receivingOrganizationId: string;
  organizationName: string;
  organizationContact: string;
  practitionerName: string;
  practitionerRole: string;
  practitionerEmail: string;
  purpose: string;
  recordFromDate?: string;
  recordToDate?: string;
  expiresAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revoked' | 'Expired';
  requestedAt?: string;
  approvedAt?: string;
  decidedAt?: string;
  revokedAt?: string;
}
