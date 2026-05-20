import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

type PatientTab = "details" | "metrics" | "sessions" | "vr";

type Props = {
  activeTab: PatientTab;
  setActiveTab: (tab: PatientTab) => void;
};

export default function SidebarPaciente({ activeTab, setActiveTab }: Props) {
  const navigate = useNavigate();

  const baseItemClass = "w-full text-left px-4 py-2 rounded transition";
  const activeItemClass = "bg-blue-50 text-blue-700 font-semibold";
  const inactiveItemClass = "hover:bg-gray-100 text-gray-700";

  const handleTab = (tab: PatientTab) => {
    localStorage.setItem("patient_active_tab", tab);
    setActiveTab(tab);

    // IMPORTANTE:
    // Aquí NO pongas navigate("/paciente/sesiones")
    // Aquí NO pongas navigate("/paciente/evolucion")
    // Solo cambia el estado.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem("patient_id");
    localStorage.removeItem("patient_dni");
    localStorage.removeItem("patient_name");
    localStorage.removeItem("patient_active_tab");

    navigate("/");
  };

  const itemClass = (tab: PatientTab) =>
    `${baseItemClass} ${
      activeTab === tab ? activeItemClass : inactiveItemClass
    }`;

  return (
    <div className="h-screen overflow-y-auto py-6 px-4 bg-white border-r border-gray-200">
      <div className="px-4 mb-8">
        <h2 className="text-xl font-semibold text-blue-600">NeuroVision</h2>
        <p className="text-sm text-gray-500">Panel paciente</p>
      </div>

      <div>
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Mi seguimiento
        </h6>

        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => handleTab("details")}
              className={itemClass("details")}
            >
              Resumen clínico
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleTab("metrics")}
              className={itemClass("metrics")}
            >
              Evolución
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleTab("sessions")}
              className={itemClass("sessions")}
            >
              Sesiones
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => handleTab("vr")}
              className={itemClass("vr")}
            >
              Ejercicios VR
            </button>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Cuenta
        </h6>

        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className={`${baseItemClass} hover:bg-red-50 text-red-500`}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}