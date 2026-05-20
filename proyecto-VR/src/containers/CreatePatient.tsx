import { useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "../supabase/supabaseClient";

type PatientFormData = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  sex: "male" | "female" | "other" | "";
  neglectSide: "left" | "right" | "bilateral" | "";
  severity: "1" | "2" | "3";
  clinicalNotes: string;
};

export default function CreatePatient() {
  const [form, setForm] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    dni: "",
    birthDate: "",
    sex: "",
    neglectSide: "",
    severity: "1",
    clinicalNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      dni: "",
      birthDate: "",
      sex: "",
      neglectSide: "",
      severity: "1",
      clinicalNotes: "",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.firstName.trim()) {
      setErrorMsg("El nombre es obligatorio.");
      return;
    }

    if (!form.dni.trim()) {
      setErrorMsg("El DNI es obligatorio.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("No hay un médico autenticado.");
        return;
      }

      const { error } = await supabase.from("patients").insert({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim() || null,
        dni: form.dni.trim(),
        birth_date: form.birthDate || null,
        sex: form.sex || null,
        neglect_side: form.neglectSide || null,
        severity: Number(form.severity) || 1,
        clinical_notes: form.clinicalNotes.trim() || null,
        doctor_id: user.id,
      });

      if (error) {
        throw error;
      }

      setSuccessMsg("Paciente creado correctamente.");
      resetForm();
    } catch (error: any) {
      setErrorMsg(error.message || "Error al crear el paciente.");
    } finally {
      setLoading(false);
    }
  };

  const sectionHeader = (title: string, subtitle: string) => (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-100 px-6 py-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );

  const inputClass =
    "bg-slate-100 w-full text-slate-900 text-sm px-4 py-3 rounded-md focus:bg-white outline-blue-500 transition-all border border-transparent focus:border-blue-300";

  return (
    <div className="max-w-5xl max-sm:max-w-lg mx-auto p-6 mt-6">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl font-semibold text-slate-900">
          Registrar paciente
        </h2>
        <h4 className="text-slate-600 text-base mt-4">
          Añade un nuevo paciente al sistema clínico
        </h4>
      </div>

      <form onSubmit={handleSubmit}>
        {sectionHeader(
          "Datos personales",
          "Información básica identificativa del paciente."
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Nombre *
            </label>
            <input
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Introduce el nombre"
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Apellidos
            </label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Introduce los apellidos"
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              DNI *
            </label>
            <input
              name="dni"
              type="text"
              value={form.dni}
              onChange={handleChange}
              className={inputClass}
              placeholder="Introduce el DNI"
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Fecha de nacimiento
            </label>
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Sexo
            </label>
            <select
              name="sex"
              value={form.sex}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecciona una opción</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        <div className="mt-12">
          {sectionHeader(
            "Información clínica",
            "Datos clínicos asociados al seguimiento y a las sesiones VR."
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Lado de negligencia
            </label>
            <select
              name="neglectSide"
              value={form.neglectSide}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecciona una opción</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Grado de gravedad
            </label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="1">1 - Leve</option>
              <option value="2">2 - Moderado</option>
              <option value="3">3 - Grave</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Notas clínicas / observaciones
            </label>
            <textarea
              name="clinicalNotes"
              value={form.clinicalNotes}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Añade observaciones clínicas relevantes..."
            />
          </div>
        </div>

        {errorMsg && (
          <p className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="mt-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </p>
        )}

        <div className="mt-12">
          <button
            type="submit"
            disabled={loading}
            className="mx-auto block min-w-32 py-3 px-6 text-sm font-medium tracking-wider rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}