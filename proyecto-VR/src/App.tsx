import { BrowserRouter, Routes, Route } from "react-router-dom";

import MedicalUI from "./containers/MedicalUI";
import Inicio from "./Pages/Inicio";
import InicioPaciente from "./Pages/InicioPaciente";
import OpenSession from "./containers/OpenSession";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login médico / paciente */}
        <Route path="/" element={<MedicalUI />} />

        {/* Panel médico */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/inicio/listaPacientes" element={<Inicio />} />
        <Route path="/inicio/anadirPaciente" element={<Inicio />} />

        {/* Detalle de paciente desde lista médica */}
        <Route path="/inicio/listaPacientes/:patientId" element={<Inicio />} />
        <Route path="/patients/:patientId" element={<Inicio />} />

        {/* Panel paciente */}
        <Route path="/paciente" element={<InicioPaciente />} />

        {/* Sesión abierta / QR */}
        <Route path="/open-session" element={<OpenSession />} />
      </Routes>
    </BrowserRouter>
  );
}