// need to be passed via a config file or env variable
const endPointUrl = 'https://localhost:7143/api/v1';

const apiPaths = {
  login: '/Users/Login',
  getUser: '/Users/GetUser',
  getOverview: '/Users/GetOverview',
};

const userRoles = {
  superUser: 'SuperUser',
  hospitalAdmin: 'HospitalAdmin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  patient: 'Patient',
};

export { endPointUrl, apiPaths, userRoles };
