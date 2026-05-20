import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Patient } from "./PatientList";
import { supabase } from "../supabase/supabaseClient";

type PatientDetailsContainerProps = {
  patient: Patient;
  isPatientView?: boolean;
};

type DoctorProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  hospital: string | null;
  specialty: string | null;
};

type EditForm = {
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string;
  sex: string;
  neglect_side: string;
  severity: string;
  clinical_notes: string;
};

export default function PatientDetail({
  patient,
  isPatientView = false,
}: PatientDetailsContainerProps) {
  const [displayPatient, setDisplayPatient] = useState<Patient>(patient);

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState<EditForm>({
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    dni: patient.dni || "",
    birth_date: patient.birth_date || "",
    sex: patient.sex || "",
    neglect_side: patient.neglect_side || "",
    severity: patient.severity ? String(patient.severity) : "",
    clinical_notes: patient.clinical_notes || "",
  });

  useEffect(() => {
    setDisplayPatient(patient);

    setForm({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      dni: patient.dni || "",
      birth_date: patient.birth_date || "",
      sex: patient.sex || "",
      neglect_side: patient.neglect_side || "",
      severity: patient.severity ? String(patient.severity) : "",
      clinical_notes: patient.clinical_notes || "",
    });
  }, [patient]);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!displayPatient.doctor_id) {
        setDoctor(null);
        return;
      }

      try {
        setLoadingDoctor(true);

        const { data, error } = await supabase
          .from("doctors_profiles")
          .select("id, first_name, last_name, hospital, specialty")
          .eq("id", displayPatient.doctor_id)
          .maybeSingle();

        if (error) {
          console.error("Error cargando doctor asignado:", error);
          setDoctor(null);
          return;
        }

        setDoctor(data);
      } catch (error) {
        console.error("Error inesperado cargando doctor:", error);
        setDoctor(null);
      } finally {
        setLoadingDoctor(false);
      }
    };

    loadDoctor();
  }, [displayPatient.doctor_id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setErrorMsg("");
    setSuccessMsg("");

    setForm({
      first_name: displayPatient.first_name || "",
      last_name: displayPatient.last_name || "",
      dni: displayPatient.dni || "",
      birth_date: displayPatient.birth_date || "",
      sex: displayPatient.sex || "",
      neglect_side: displayPatient.neglect_side || "",
      severity: displayPatient.severity ? String(displayPatient.severity) : "",
      clinical_notes: displayPatient.clinical_notes || "",
    });
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPatientView) return;

    setErrorMsg("");
    setSuccessMsg("");

    if (!form.first_name.trim() || !form.dni.trim()) {
      setErrorMsg("El nombre y el DNI son obligatorios.");
      return;
    }

    try {
      setSaving(true);

      const updatedAt = new Date().toISOString();

      const updatePayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        dni: form.dni.trim(),
        birth_date: form.birth_date || null,
        sex: form.sex || null,
        neglect_side: form.neglect_side || null,
        severity: form.severity ? Number(form.severity) : null,
        clinical_notes: form.clinical_notes.trim() || null,
        updated_at: updatedAt,
      };

      const { data, error } = await supabase
        .from("patients")
        .update(updatePayload)
        .eq("id", displayPatient.id)
        .select(
          "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at, birth_date, sex, clinical_notes"
        )
        .single();

      if (error) {
        console.error("Error actualizando paciente:", error);
        setErrorMsg(error.message || "No se pudo actualizar el paciente.");
        return;
      }

      setDisplayPatient(data as Patient);
      setEditing(false);
      setSuccessMsg("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error inesperado actualizando paciente:", error);
      setErrorMsg("Ha ocurrido un error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
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

  const getDoctorName = () => {
    if (loadingDoctor) return "Cargando doctor...";
    if (!displayPatient.doctor_id) return "No asignado";
    if (!doctor) return "Doctor no encontrado";

    const fullName = `${doctor.first_name ?? ""} ${
      doctor.last_name ?? ""
    }`.trim();

    return fullName || "Doctor sin nombre registrado";
  };

  const getDoctorExtraInfo = () => {
    if (!doctor) return null;

    const info = [doctor.specialty, doctor.hospital].filter(Boolean).join(" · ");

    return info || null;
  };

  const readOnlyCard = (label: string, value: string | number | null) => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-medium text-gray-800">{value || "-"}</p>
    </div>
  );

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (editing && !isPatientView) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <form onSubmit={handleSave}>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Editar perfil del paciente
              </h2>
              <p className="text-gray-500 mt-1">
                Modifica los datos personales, información clínica y observaciones.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-300 transition disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">Nombre</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">
                Apellidos
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">DNI</label>
              <input
                name="dni"
                value={form.dni}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">Sexo</label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">No especificado</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">
                Lado neglect
              </label>
              <select
                name="neglect_side"
                value={form.neglect_side}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">No especificado</option>
                <option value="left">Izquierdo</option>
                <option value="right">Derecho</option>
                <option value="bilateral">Bilateral</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm text-gray-500 mb-2">
                Severidad
              </label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">No especificado</option>
                <option value="1">Leve</option>
                <option value="2">Moderado</option>
                <option value="3">Severo</option>
              </select>
            </div>

            {readOnlyCard(
              "Fecha de alta / creación",
              formatDateTime(displayPatient.created_at)
            )}

            {readOnlyCard(
              "Última actualización",
              formatDateTime(displayPatient.updated_at)
            )}
          </div>

          <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="block text-sm text-gray-500 mb-2">
              Notas clínicas / observaciones
            </label>
            <textarea
              name="clinical_notes"
              value={form.clinical_notes}
              onChange={handleChange}
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="Escribe notas clínicas u observaciones..."
            />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Resumen clínico
          </h2>
          <p className="text-gray-500 mt-1">
            Datos personales, información clínica y observaciones del paciente.
          </p>
        </div>

        {!isPatientView && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Editar perfil
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readOnlyCard("Nombre", displayPatient.first_name)}
        {readOnlyCard("Apellidos", displayPatient.last_name || "-")}
        {readOnlyCard("DNI", displayPatient.dni)}
        {readOnlyCard("Fecha de nacimiento", formatDate(displayPatient.birth_date))}
        {readOnlyCard("Sexo", formatSex(displayPatient.sex))}
        {readOnlyCard(
          "Lado neglect",
          formatNeglectSide(displayPatient.neglect_side)
        )}
        {readOnlyCard("Severidad", formatSeverity(displayPatient.severity))}

        {isPatientView && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Doctor asignado</p>
            <p className="text-lg font-medium text-gray-800">
              {getDoctorName()}
            </p>

            {getDoctorExtraInfo() && (
              <p className="text-sm text-gray-500 mt-1">
                {getDoctorExtraInfo()}
              </p>
            )}
          </div>
        )}

        {readOnlyCard(
          "Fecha de alta / creación",
          formatDateTime(displayPatient.created_at)
        )}

        {readOnlyCard(
          "Última actualización",
          formatDateTime(displayPatient.updated_at)
        )}
      </div>

      <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          Notas clínicas / observaciones
        </p>
        <p className="text-base text-gray-800 whitespace-pre-line">
          {displayPatient.clinical_notes || "Sin observaciones registradas."}
        </p>
      </div>
    </div>
  );
}