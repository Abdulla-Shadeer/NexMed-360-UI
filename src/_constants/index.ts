// need to be passed via a config file or env variable
const endPointUrl = 'https://localhost:7143/api/v1';

const apiPaths = {
  login: '/Users/Login',
  getUser: '/Users/GetUser',
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
};

const userRoles = {
  superUser: 'SuperUser',
  hospitalAdmin: 'HospitalAdmin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  patient: 'Patient',
};

export { endPointUrl, apiPaths, userRoles };
