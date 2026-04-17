import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

type Props = {
  setView: (view: string) => void;
};

export default function SidebarMenu({ setView }: Props) {
  const navigate = useNavigate();

  const baseItemClass =
    "w-full text-left px-4 py-2 rounded transition";
  const activeItemClass =
    "hover:bg-gray-100 text-gray-700";
  const disabledItemClass =
    "text-gray-400 cursor-not-allowed";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/");
    }
  };

  return (
    <div className="h-screen overflow-y-auto py-6 px-4 bg-white border-r border-gray-200">
      <div className="px-4 mb-8">
        <h2 className="text-xl font-semibold text-blue-600">NeuroVision</h2>
        <p className="text-sm text-gray-500">Panel médico</p>
      </div>

      {/* DASHBOARD */}
      <div>
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Dashboard
        </h6>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setView("dashboard")}
              className={`${baseItemClass} ${activeItemClass} font-medium`}
            >
              Resumen general
            </button>
          </li>
        </ul>
      </div>

      {/* PACIENTES */}
      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Pacientes
        </h6>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setView("patients")}
              className={`${baseItemClass} ${activeItemClass}`}
            >
              Lista de pacientes
            </button>
          </li>
          <li>
            <button
              onClick={() => setView("createPatient")}
              className={`${baseItemClass} ${activeItemClass}`}
            >
              Añadir paciente
            </button>
          </li>
        </ul>
      </div>

      {/* REHABILITACIÓN */}
      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Rehabilitación
        </h6>
        <ul className="space-y-1">
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Sesiones de hoy
            </button>
          </li>
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Agenda / programadas
            </button>
          </li>
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Acceso rápido a ejercicios
            </button>
          </li>
        </ul>
      </div>

      {/* RESULTADOS */}
      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Resultados
        </h6>
        <ul className="space-y-1">
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Comparativas globales
            </button>
          </li>
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Estadísticas por paciente / grupo
            </button>
          </li>
        </ul>
      </div>

      {/* CUENTA */}
      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Cuenta
        </h6>
        <ul className="space-y-1">
          <li>
            <button
              disabled
              className={`${baseItemClass} ${disabledItemClass}`}
            >
              Mi perfil
            </button>
          </li>
          <li>
            <button
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