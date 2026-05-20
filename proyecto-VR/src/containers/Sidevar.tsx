import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

type Props = {
  setView: (view: string) => void;
};

type UserRole = "doctor" | "patient" | null;

export default function SidebarMenu({ setView }: Props) {
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const baseItemClass = "w-full text-left px-4 py-2 rounded transition";
  const activeItemClass = "hover:bg-gray-100 text-gray-700";
  const disabledItemClass = "text-gray-400 cursor-not-allowed";

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      setLoadingRole(true);

      /**
       * 1. Comprobar si hay médico logueado con Supabase Auth
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        const { data: doctorProfile, error: doctorError } = await supabase
          .from("doctors_profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (doctorError) {
          console.error("Error comprobando perfil médico:", doctorError);
        }

        if (doctorProfile) {
          setRole("doctor");
          return;
        }
      }

      /**
       * 2. Comprobar si hay paciente logueado mediante localStorage
       */
      const patientId = localStorage.getItem("patient_id");

      if (patientId) {
        const { data: patientProfile, error: patientError } = await supabase
          .from("patients")
          .select("id")
          .eq("id", patientId)
          .maybeSingle();

        if (patientError) {
          console.error("Error comprobando perfil paciente:", patientError);
        }

        if (patientProfile) {
          setRole("patient");
          return;
        }
      }

      /**
       * 3. Si no hay sesión válida, volver al login
       */
      setRole(null);
      navigate("/");
    } catch (error) {
      console.error("Error comprobando usuario:", error);
      setRole(null);
      navigate("/");
    } finally {
      setLoadingRole(false);
    }
  };

  const handleLogout = async () => {
    try {
      /**
       * Logout médico
       */
      await supabase.auth.signOut();

      /**
       * Logout paciente
       */
      localStorage.removeItem("patient_id");
      localStorage.removeItem("patient_dni");
      localStorage.removeItem("patient_name");

      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      localStorage.removeItem("patient_id");
      localStorage.removeItem("patient_dni");
      localStorage.removeItem("patient_name");

      navigate("/");
    }
  };

  if (loadingRole) {
    return (
      <div className="h-screen overflow-y-auto py-6 px-4 bg-white border-r border-gray-200">
        <div className="px-4 mb-8">
          <h2 className="text-xl font-semibold text-blue-600">NeuroVision</h2>
          <p className="text-sm text-gray-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="h-screen overflow-y-auto py-6 px-4 bg-white border-r border-gray-200">
      <div className="px-4 mb-8">
        <h2 className="text-xl font-semibold text-blue-600">NeuroVision</h2>

        <p className="text-sm text-gray-500">
          {role === "doctor" ? "Panel médico" : "Panel paciente"}
        </p>
      </div>

      {role === "doctor" ? (
        <>
          {/* DASHBOARD MÉDICO */}
          <div>
            <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
              Dashboard
            </h6>

            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setView("dashboard");
                    navigate("/inicio");
                  }}
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
                  onClick={() => {
                    setView("patients");
                    navigate("/inicio/listaPacientes");
                  }}
                  className={`${baseItemClass} ${activeItemClass}`}
                >
                  Lista de pacientes
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setView("createPatient");
                    navigate("/inicio/anadirPaciente");
                  }}
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
        </>
      ) : (
        <>
          {/* PANEL PACIENTE */}
          <div>
            <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
              Mi seguimiento
            </h6>

            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setView("patientSummary");
                    navigate("/paciente");
                  }}
                  className={`${baseItemClass} ${activeItemClass} font-medium`}
                >
                  Resumen
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setView("patientEvolution");
                    navigate("/paciente/evolucion");
                  }}
                  className={`${baseItemClass} ${activeItemClass}`}
                >
                  Evolución
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setView("patientSessions");
                    navigate("/paciente/sesiones");
                  }}
                  className={`${baseItemClass} ${activeItemClass}`}
                >
                  Mis sesiones
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setView("patientExercises");
                    navigate("/paciente/ejercicios");
                  }}
                  className={`${baseItemClass} ${activeItemClass}`}
                >
                  Ejercicios VR
                </button>
              </li>
            </ul>
          </div>

          {/* INFORMACIÓN */}
          <div className="mt-6">
            <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
              Información
            </h6>

            <ul className="space-y-1">
              <li>
                <button
                  disabled
                  className={`${baseItemClass} ${disabledItemClass}`}
                >
                  Recomendaciones
                </button>
              </li>

              <li>
                <button
                  disabled
                  className={`${baseItemClass} ${disabledItemClass}`}
                >
                  Ayuda
                </button>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* CUENTA */}
      <div className="mt-6">
        <h6 className="text-blue-600 text-sm font-semibold px-4 mb-2">
          Cuenta
        </h6>

        <ul className="space-y-1">
          <li>
            <button disabled className={`${baseItemClass} ${disabledItemClass}`}>
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