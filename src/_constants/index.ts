// need to be passed via a config file or env variable
const API_ENDPOINT = 'http://localhost:5098/api/v1';

const API_PATHS = {
  login: '/Users/Login',
  getUser: '/Users/GetUser',
  updateUser: '/Users/UpdateUser',
  getOverview: '/Users/GetOverview',
  createAppointment: '/Appointments/Create',
  viewOwnAppointments: '/Appointments/ViewOwn',
  viewHospitalAppointments: '/Appointments/ViewHospital',
  viewAppointmentById: (id: string): string => `/Appointments/View/${id}`,
  cancelAppointment: '/Appointments/Cancel',
  confirmAppointment: (id: string): string => `/Appointments/Confirm/${id}`,
  completeAppointment: (id: string): string => `/Appointments/Complete/${id}`,
  confirmPatientArrival: (id: string): string =>
    `/Appointments/ConfirmArrival/${id}`,
  confirmEncounterInProgress: (id: string): string =>
    `/Appointments/ConfirmInProgress/${id}`,
  entitySearch: '/Search/Entity',
  doctorSearch: '/Search/Doctor',
  getAllHospitals: '/Hospital/GetAll',
  getHospitalById: (id: string): string => `/Hospital/FindById/${id}`,
  addHospital: '/Hospital/Add',
  updateHospital: '/Hospital/Update',
  assignHospitalAdmin: '/Hospital/AssignAdmin',
  getHospitalMembers: (hospitalId: string) =>
    `/Hospital/GetMembers/${hospitalId}`,
  addDoctor: '/Hospital/AddDoctor',
  addReceptionist: '/Hospital/AddReceptionist',
  addPatient: '/Patient/Create',
  getPatient: (id: string) => `/Patient/Get/${id}`,
  getClinicRecord: (id: string) => `/Patient/GetClinicRecord/${id}`,
  getClinicRecords: (patientId: string) =>
    `/Patient/GetClinicRecords/${patientId}`,
  addClinicRecord: '/Patient/AddClinicRecord',
  getDoctorSessions: '/DoctorSession/Get',
  getSessionSlots: '/DoctorSession/GetSlots',
  createDoctorSession: '/DoctorSession/Create',
  startDoctorSession: (sessionId: string) =>
    `/DoctorSession/Start/${sessionId}`,
  updateDoctorSessionHistory: '/DoctorSession/UpdateHistory',
  getDoctorSessionHistory: '/DoctorSession/GetHistory',
  getCurrentOrUpcomingSession: '/DoctorSession/GetCurrentOrUpcoming',
  getHasAnySessionToday: '/DoctorSession/HasAnySessionToday',
  getOngoingSessions: '/DoctorSession/GetOngoing',
  updateDoctorSession: (sessionId: string) =>
    `/DoctorSession/Update/${sessionId}`,
  deleteDoctorSession: (sessionId: string) =>
    `/DoctorSession/Delete/${sessionId}`,
};

const USER_ROLES = {
  superUser: 'SuperUser',
  hospitalAdmin: 'HospitalAdmin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  patient: 'Patient',
};

export { API_ENDPOINT, API_PATHS, USER_ROLES };
