import type { Patient } from "./PatientList";

type PatientDetailsContainerProps = {
  patient: Patient;
};

export default function PatientDetail({
  patient,
}: PatientDetailsContainerProps) {
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

  const formatSex = (sex: string | null) => {
    switch (sex) {
      case "male":
        return "Masculino";
      case "female":
        return "Femenino";
      case "other":
        return "Otro";
      default:
        return sex || "No especificado";
    }
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-ES");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-ES");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Resumen clínico
        </h2>
        <p className="text-gray-500 mt-1">
          Datos personales, información clínica y observaciones del paciente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Nombre</p>
          <p className="text-lg font-medium text-gray-800">
            {patient.first_name}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Apellidos</p>
          <p className="text-lg font-medium text-gray-800">
            {patient.last_name || "-"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">DNI</p>
          <p className="text-lg font-medium text-gray-800">{patient.dni}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Fecha de nacimiento</p>
          <p className="text-lg font-medium text-gray-800">
            {formatDate(patient.birth_date)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Sexo</p>
          <p className="text-lg font-medium text-gray-800">
            {formatSex(patient.sex)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Lado neglect</p>
          <p className="text-lg font-medium text-gray-800">
            {formatNeglectSide(patient.neglect_side)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Severidad</p>
          <p className="text-lg font-medium text-gray-800">
            {formatSeverity(patient.severity)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Doctor asignado</p>
          <p className="text-lg font-medium text-gray-800">
            {patient.doctor_id || "No asignado"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Fecha de alta / creación</p>
          <p className="text-lg font-medium text-gray-800">
            {formatDateTime(patient.created_at)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Última actualización</p>
          <p className="text-lg font-medium text-gray-800">
            {formatDateTime(patient.updated_at)}
          </p>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Notas clínicas / observaciones</p>
        <p className="text-base text-gray-800 whitespace-pre-line">
          {patient.clinical_notes || "Sin observaciones registradas."}
        </p>
      </div>
    </div>
  );
}