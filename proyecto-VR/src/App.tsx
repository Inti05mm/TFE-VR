import { BrowserRouter, Routes, Route } from "react-router-dom";


import MedicalUI from "./containers/MedicalUI";
import Inicio from "./Pages/Inicio";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página inicial → registro/login */}
        <Route path="/" element={<MedicalUI />} />

        {/* Página después de registrarse */}
        <Route path="/Inicio" element={<Inicio/>} />

        <Route path="/patients/:patientId" element={<Inicio />} />

      </Routes>
    </BrowserRouter>
  );
}