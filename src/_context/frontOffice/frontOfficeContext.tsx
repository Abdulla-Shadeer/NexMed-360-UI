import { ViewAppointmentDto } from '_types/dtos';
import { createContext, ReactNode, useContext, useState } from 'react';

interface PatientMeta {
  currentAppointment?: ViewAppointmentDto;
  appointmentsForToday?: ViewAppointmentDto[];
}

interface FrontOfficeContext {
  patientMeta?: PatientMeta;
  setPatientMeta: (patientMeta?: PatientMeta) => void;
}

const defaultContext: FrontOfficeContext = { setPatientMeta: () => {} };
const context = createContext<FrontOfficeContext>(defaultContext);

function FrontOfficeProvider({ children }: { children: ReactNode }) {
  const [patientMeta, setPatientMeta] = useState<PatientMeta | undefined>(
    undefined,
  );
  return (
    <context.Provider value={{ patientMeta, setPatientMeta }}>
      {children}
    </context.Provider>
  );
}

function useFrontOffice() {
  return useContext(context);
}

export { FrontOfficeProvider, useFrontOffice };
