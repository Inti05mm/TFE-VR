import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarPaciente from "../containers/SidevarPaciente";
import PatientProfileContainer from "../containers/PatientProfileContainer";
import { type Patient } from "../containers/PatientList";
import { supabase } from "../supabase/supabaseClient";

type PatientTab = "details" | "metrics" | "sessions" | "vr";

export default function InicioPaciente() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const savedTab = localStorage.getItem("patient_active_tab") as PatientTab | null;

  const [activeTab, setActiveTab] = useState<PatientTab>(
    savedTab ?? "details"
  );

  const navigate = useNavigate();

  useEffect(() => {
    const loadLoggedPatient = async () => {
      try {
        setLoadingPatient(true);

        const patientId = localStorage.getItem("patient_id");

        if (!patientId) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from("patients")
          .select(
            "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at, birth_date, sex, clinical_notes"
          )
          .eq("id", patientId)
          .single();

        if (error) {
          console.error("Error al cargar el paciente:", error);

          localStorage.removeItem("patient_id");
          localStorage.removeItem("patient_dni");
          localStorage.removeItem("patient_name");
          localStorage.removeItem("patient_active_tab");

          navigate("/");
          return;
        }

        setSelectedPatient(data);
      } catch (error) {
        console.error("Error cargando panel del paciente:", error);
        navigate("/");
      } finally {
        setLoadingPatient(false);
      }
    };

    loadLoggedPatient();
  }, [navigate]);

  const renderContent = () => {
    if (loadingPatient) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-500">
          Cargando paciente...
        </div>
      );
    }

    if (!selectedPatient) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-500">
          No se ha podido cargar el paciente.
        </div>
      );
    }

    return (
<PatientProfileContainer
  patient={selectedPatient}
  onBack={() => navigate("/paciente")}
  activeTabExternal={activeTab}
  setActiveTabExternal={setActiveTab}
  hidePatientTabs={true}
  isPatientView={true}
/>
    );
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
        <SidebarPaciente
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-100 transition"
          >
            {sidebarOpen ? (
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