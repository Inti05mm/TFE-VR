import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

export type Patient = {
  id: string;
  first_name: string;
  last_name: string | null;
  dni: string;
  neglect_side: "left" | "right" | "bilateral" | null;
  severity: 1 | 2 | 3 | null;
  doctor_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  birth_date: string | null;
  sex: string | null;
  clinical_notes: string | null;
};

type ListaPacientesProps = {
  onViewPatient: (patient: Patient) => void;
  onStartSession: (patient: Patient) => void;
};

export default function ListaPacientes({
  onViewPatient,
  onStartSession,
}: ListaPacientesProps) {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDni, setSearchDni] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("No hay un médico autenticado.");
      setPatients([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("patients")
      .select(
        "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at, birth_date, sex, clinical_notes"
      )
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Error al cargar los pacientes.");
      console.error(error);
      setPatients([]);
    } else {
      setPatients(data || []);
    }

    setLoading(false);
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.first_name} ${patient.last_name || ""}`.toLowerCase();

    return (
      fullName.includes(searchName.toLowerCase()) &&
      patient.dni.toLowerCase().includes(searchDni.toLowerCase())
    );
  });

  const handleViewPatient = (patient: Patient) => {
    onViewPatient(patient);
    navigate(`/inicio/listaPacientes/${patient.id}`);
  };

  const formatNeglectSide = (side: Patient["neglect_side"]) => {
    switch (side) {
      case "left":
        return "Izquierdo";
      case "right":
        return "Derecho";
      case "bilateral":
        return "Bilateral";
      default:
        return "No especificado";
    }
  };

  const formatSeverity = (severity: Patient["severity"]) => {
    switch (severity) {
      case 1:
        return "Leve";
      case 2:
        return "Moderado";
      case 3:
        return "Severo";
      default:
        return "No especificado";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-ES");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Lista de pacientes
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí puedes consultar tus pacientes registrados.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Buscar por número documento"
          value={searchDni}
          onChange={(e) => setSearchDni(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Cargando pacientes...
        </div>
      )}

      {error && (
        <div className="py-4 px-4 mb-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredPatients.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          No se encontraron pacientes.
        </div>
      )}

      {!loading && !error && filteredPatients.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Apellidos</th>
                <th className="px-4 py-3 font-semibold">DNI</th>
                <th className="px-4 py-3 font-semibold">Lado neglect</th>
                <th className="px-4 py-3 font-semibold">Severidad</th>
                <th className="px-4 py-3 font-semibold">Fecha alta</th>
              
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-800">
                    {patient.first_name}
                  </td>

                  <td className="px-4 py-3 text-gray-800">
                    {patient.last_name || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-800">{patient.dni}</td>

                  <td className="px-4 py-3 text-gray-800">
                    {formatNeglectSide(patient.neglect_side)}
                  </td>

                  <td className="px-4 py-3 text-gray-800">
                    {formatSeverity(patient.severity)}
                  </td>

                  <td className="px-4 py-3 text-gray-800">
                    {formatDate(patient.created_at)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        Ver
                      </button>

                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}