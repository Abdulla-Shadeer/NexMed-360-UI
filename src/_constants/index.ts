// need to be passed via a config file or env variable
const endPointUrl = 'https://localhost:7143/api/v1';

const apiPaths = {
  login: '/Users/Login',
  getUser: '/Users/GetUser',
  updateUser: '/Users/UpdateUser',
  getOverview: '/Users/GetOverview',
  createAppointment: '/Appointments/Create',
  editAppointment: '/Appointments/Edit',
  viewOwnAppointments: '/Appointments/ViewOwn',
  viewHospitalAppointments: '/Appointments/ViewHospital',
  viewAppointmentById: (id: string): string => `/Appointments/View/${id}`,
  cancelAppointment: '/Appointments/Cancel',
  confirmAppointment: (id: string): string => `/Appointments/Confirm/${id}`,
  completeAppointment: (id: string): string => `/Appointments/Complete/${id}`,
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
  getDoctorSessions: (doctorId: string) =>
    `/Appointments/GetDoctorSessions/${doctorId}`,
  getSessionSlots: '/Appointments/GetSessionSlots',
  createDoctorSession: '/Appointments/CreateDoctorSession',
};

const userRoles = {
  superUser: 'SuperUser',
  hospitalAdmin: 'HospitalAdmin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  patient: 'Patient',
};

export { endPointUrl, apiPaths, userRoles };
