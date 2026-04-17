import { useState } from "react";
import SidebarMenu from "../containers/Sidevar";
import CreatePatient from "../containers/CreatePatient";
import ListaPacientes, { type Patient } from "../containers/PatientList";
import PatientProfileContainer from "../containers/PatientProfileContainer";

export default function Inicio() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setView("patientProfile");
  };

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Dashboard médico
            </h1>
            <p className="text-gray-500 mt-2">
              Aquí se verá el resumen de pacientes y su evolución.
            </p>
          </div>
        );

      case "patients":
        return <ListaPacientes onViewPatient={handleViewPatient} onStartSession={function (patient: Patient): void {
          throw new Error("Function not implemented.");
        } } />;

      case "patientProfile":
        return selectedPatient ? (
          <PatientProfileContainer
            patient={selectedPatient}
            onBack={() => setView("patients")}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-500">
            No hay paciente seleccionado.
          </div>
        );

      case "createPatient":
        return <CreatePatient />;

      default:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-500">
            Contenido pendiente.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`
          relative z-30 bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-[280px] translate-x-0" : "w-0 -translate-x-full"}
          overflow-hidden flex-shrink-0
        `}
      >
        <SidebarMenu setView={setView} />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
          <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-100 transition"
>
  {sidebarOpen ? (
    // ← sidebar abierto (icono cerrar)
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2426 6.34317L14.8284 4.92896L7.75739 12L14.8285 19.0711L16.2427 17.6569L10.5858 12L16.2426 6.34317Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    // → sidebar cerrado (icono abrir)
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5858 6.34317L12 4.92896L19.0711 12L12 19.0711L10.5858 17.6569L16.2427 12L10.5858 6.34317Z"
        fill="currentColor"
      />
    </svg>
  )}
</button>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}