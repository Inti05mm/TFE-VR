import { BrowserRouter, Routes, Route } from "react-router-dom";

import MedicalUI from "./containers/MedicalUI";
import Inicio from "./Pages/Inicio";
import OpenSession from "./containers/OpenSession";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MedicalUI />} />

        <Route path="/inicio" element={<Inicio />} />
        <Route path="/open-session" element={<OpenSession />} />  
        <Route path="/inicio/listaPacientes" element={<Inicio />} />
        <Route path="/inicio/anadirPaciente" element={<Inicio />} />

        {/* Detalle de paciente desde lista de pacientes */}
        <Route path="/inicio/listaPacientes/:patientId" element={<Inicio />} />

        {/* Puedes dejar esta si ya la usabas antes */}
        <Route path="/patients/:patientId" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}