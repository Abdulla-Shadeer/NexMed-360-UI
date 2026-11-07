const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const API_PATHS = {
  login: '/Users/Login',
  getUser: '/Users/GetUser',
  updateUser: '/Users/UpdateUser',
  getOverview: '/Users/GetOverview',
  createAppointment: '/Appointments/Create',
  viewOwnAppointments: '/Appointments/ViewOwn',
  viewOrganizationAppointments: '/Appointments/ViewOrganization',
  viewAppointmentById: (id: string): string => `/Appointments/View/${id}`,
  cancelAppointment: '/Appointments/Cancel',
  confirmAppointment: (id: string): string => `/Appointments/Confirm/${id}`,
  completeAppointment: (id: string): string => `/Appointments/Complete/${id}`,
  confirmPatientArrival: (id: string): string =>
    `/Appointments/ConfirmArrival/${id}`,
  confirmEncounterInProgress: (id: string): string =>
    `/Appointments/ConfirmInProgress/${id}`,
  entitySearch: '/Search/Entity',
  practitionerRoleSearch: '/Search/PractitionerRole',
  getAllOrganizations: '/Organization/GetAll',
  getOrganizationById: (id: string): string => `/Organization/FindById/${id}`,
  addOrganization: '/Organization/Add',
  updateOrganization: '/Organization/Update',
  assignOrganizationManager: '/Organization/AssignAdmin',
  getOrganizationMembers: (organizationId: string) =>
    `/Organization/GetMembers/${organizationId}`,
  addPractitionerRole: '/Organization/AddPractitionerRole',
  addOrganizationMember: '/Organization/AddOrganizationMember',
  addPatient: '/Patient/Create',
  getPatient: (id: string) => `/Patient/Get/${id}`,
  getClinicalRecord: (id: string) => `/Patient/GetClinicalRecord/${id}`,
  getClinicalRecords: (patientId: string) =>
    `/Patient/GetClinicalRecords/${patientId}`,
  addClinicalRecord: '/Patient/AddClinicalRecord',
  getPractitionerSchedules: '/PractitionerSchedule/Get',
  getSessionSlots: '/PractitionerSchedule/GetSlots',
  createPractitionerSchedule: '/PractitionerSchedule/Create',
  startPractitionerSchedule: (sessionId: string) =>
    `/PractitionerSchedule/Start/${sessionId}`,
  updatePractitionerScheduleHistory: '/PractitionerSchedule/UpdateHistory',
  getPractitionerScheduleHistory: '/PractitionerSchedule/GetHistory',
  getCurrentOrUpcomingSession: '/PractitionerSchedule/GetCurrentOrUpcoming',
  getHasAnySessionToday: '/PractitionerSchedule/HasAnySessionToday',
  getOngoingSessions: '/PractitionerSchedule/GetOngoing',
  updatePractitionerSchedule: (sessionId: string) =>
    `/PractitionerSchedule/Update/${sessionId}`,
  deletePractitionerSchedule: (sessionId: string) =>
    `/PractitionerSchedule/Delete/${sessionId}`,
};

const USER_ROLES = {
  platformAdmin: 'PlatformAdmin',
  organizationManager: 'OrganizationManager',
  organizationMember: 'OrganizationMember',
  practitionerRole: 'Practitioner',
  patient: 'Patient',
};

export { API_ENDPOINT, API_PATHS, USER_ROLES };
