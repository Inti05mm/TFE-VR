import {
  useMemo,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  BadgeCheck,
  Stethoscope,
  ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../supabase/supabaseClient";

type UserArea = "doctor" | "patient";
type AuthMode = "login" | "register";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  dni: string;
  hospital: string;
  specialty: string;
  licenseNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginFormData = {
  email: string;
  password: string;
};

type InfoCardProps = {
  title: string;
  text: string;
};

type InputFieldProps = {
  label: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

type AuthVisualProps = {
  area: UserArea;
  onSwitchArea: () => void;
};

const DOCTOR_HOME_ROUTE = "/inicio";
const PATIENT_HOME_ROUTE = "/patient-home";

export default function MedicalUI() {
  const [area, setArea] = useState<UserArea>("doctor");

  const handleSwitchArea = () => {
    setArea((prev) => (prev === "doctor" ? "patient" : "doctor"));
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 items-stretch md:grid-cols-2">
          <div
            className={`transition-transform duration-700 ease-in-out ${
              area === "doctor"
                ? "md:translate-x-0"
                : "md:translate-x-full"
            }`}
          >
            <AuthVisual area={area} onSwitchArea={handleSwitchArea} />
          </div>

          <div
            className={`transition-transform duration-700 ease-in-out ${
              area === "doctor"
                ? "md:translate-x-0"
                : "md:-translate-x-full"
            }`}
          >
            <AuthPanel area={area} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthVisual({ area, onSwitchArea }: AuthVisualProps) {
  const isDoctorMode = area === "doctor";

  return (
    <div className="relative flex h-full min-h-[760px] flex-col justify-start overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-800 to-[#081225] p-8 lg:p-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-cyan-300 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-blue-400 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
            <Stethoscope className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100/80">
              VR Clinical Platform
            </p>
            <h2 className="text-2xl font-semibold">NeuroVision Care</h2>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <button
          type="button"
          onClick={onSwitchArea}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {isDoctorMode
            ? "Iniciar sesión como paciente"
            : "Iniciar sesión como médico"}
        </button>
      </div>

      <div className="relative z-10 max-w-md mt-10 transition-all duration-500">
        <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-cyan-50 backdrop-blur-md">
          {isDoctorMode ? "Área médica" : "Área paciente"}
        </div>

        <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
          {isDoctorMode
            ? "Acceso seguro para seguimiento clínico en realidad virtual."
            : "Accede a tu seguimiento clínico de forma sencilla."}
        </h1>

        <p className="mt-5 text-base leading-7 text-cyan-50/80">
          {isDoctorMode
            ? "Plataforma para médicos y hospitales con gestión de pacientes, métricas clínicas y sesiones de rehabilitación visual."
            : "Consulta tus sesiones, evolución y resultados registrados por tu médico desde el área paciente."}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {isDoctorMode ? (
            <>
              <InfoCard title="Pacientes" text="Gestión clínica" />
              <InfoCard title="Métricas" text="Resultados por sesión" />
              <InfoCard title="VR Rehab" text="Ejercicios conectados" />
            </>
          ) : (
            <>
              <InfoCard title="Seguimiento" text="Evolución clínica" />
              <InfoCard title="Sesiones" text="Historial personal" />
              <InfoCard title="Acceso seguro" text="Credenciales médicas" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, text }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-cyan-50/75">{text}</p>
    </div>
  );
}

function AuthPanel({ area }: { area: UserArea }) {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="flex h-full min-h-[760px] items-center justify-center bg-[#0f172a]/90 p-6 sm:p-8 lg:p-12">
      <div className="w-full max-w-xl">
        {area === "doctor" && (
          <div className="mb-8 flex rounded-2xl border border-white/10 bg-[#111827] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {area === "doctor" && mode === "login" && <DoctorLoginForm />}
        {area === "doctor" && mode === "register" && <DoctorRegisterForm />}
        {area === "patient" && <PatientLoginForm />}
      </div>
    </div>
  );
}

function DoctorLoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMsg("Introduce el correo y la contraseña.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = form.email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: form.password,
      });

      if (error) {
        setErrorMsg("Correo o contraseña incorrectos.");
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        setErrorMsg("No se pudo iniciar sesión.");
        return;
      }

      const { data: doctorProfile, error: profileError } = await supabase
        .from("doctors_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setErrorMsg("Error al comprobar el perfil médico.");
        await supabase.auth.signOut();
        return;
      }

      if (!doctorProfile) {
        setErrorMsg("Esta cuenta no pertenece al área médica.");
        await supabase.auth.signOut();
        return;
      }

      setSuccessMsg("Inicio de sesión correcto.");
      navigate(DOCTOR_HOME_ROUTE);
    } catch (error) {
      setErrorMsg("Ha ocurrido un error al iniciar sesión.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-400">
          Área médica
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Bienvenido de nuevo
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Accede con tu correo profesional para entrar al panel clínico.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <InputField
          label="Correo profesional"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="nombre@hospital.com"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />

        <InputField
          label="Contraseña"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Introduce tu contraseña"
          type={showPassword ? "text" : "password"}
          icon={<Lock className="h-5 w-5" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        {errorMsg && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar al área médica"}
        </button>
      </form>
    </div>
  );
}

function PatientLoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMsg("Introduce el correo y la contraseña.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = form.email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: form.password,
      });

      if (error) {
        setErrorMsg("Correo o contraseña incorrectos.");
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        setErrorMsg("No se pudo iniciar sesión.");
        return;
      }

      const { data: patientProfile, error: profileError } = await supabase
        .from("patients")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (profileError) {
        setErrorMsg("Error al comprobar el perfil del paciente.");
        await supabase.auth.signOut();
        return;
      }

      if (!patientProfile) {
        setErrorMsg("Esta cuenta no pertenece al área paciente.");
        await supabase.auth.signOut();
        return;
      }

      setSuccessMsg("Inicio de sesión correcto.");
      navigate(PATIENT_HOME_ROUTE);
    } catch (error) {
      setErrorMsg("Ha ocurrido un error al iniciar sesión.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-400">
          Área paciente
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Acceso del paciente
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Accede para consultar tu seguimiento y tus sesiones de rehabilitación.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <InputField
          label="Correo electrónico"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="paciente@email.com"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />

        <InputField
          label="Contraseña"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Introduce tu contraseña"
          type={showPassword ? "text" : "password"}
          icon={<Lock className="h-5 w-5" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-400 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        {errorMsg && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar al área paciente"}
        </button>
      </form>
    </div>
  );
}

function DoctorRegisterForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    dni: "",
    hospital: "",
    specialty: "",
    licenseNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const passwordsMatch = useMemo(() => {
    if (!form.confirmPassword) return true;
    return form.password === form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    if (name === "accepted") {
      setAccepted(checked);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dni.trim() ||
      !form.hospital.trim() ||
      !form.specialty.trim() ||
      !form.licenseNumber.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (!accepted) {
      setErrorMsg("Debes confirmar que eres personal autorizado.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = form.email.trim().toLowerCase();

      const { data: existingDoctor, error: existingDoctorError } = await supabase
        .from("doctors_profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingDoctorError) {
        setErrorMsg("Error al comprobar si el correo ya existe.");
        return;
      }

      if (existingDoctor) {
        setErrorMsg("Ya existe una cuenta médica con ese correo.");
        return;
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: form.password,
        });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        return;
      }

      const userId = signUpData.user?.id;

      if (!userId) {
        setErrorMsg("No se pudo crear el usuario.");
        return;
      }

      const { error: insertError } = await supabase
        .from("doctors_profiles")
        .insert({
          id: userId,
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          dni: form.dni.trim(),
          license_number: form.licenseNumber.trim(),
          hospital: form.hospital.trim(),
          specialty: form.specialty.trim(),
          email: normalizedEmail,
        });

      if (insertError) {
        setErrorMsg(insertError.message);
        return;
      }

      setSuccessMsg("Cuenta médica creada correctamente.");
      navigate(DOCTOR_HOME_ROUTE);
    } catch (error) {
      setErrorMsg("Ha ocurrido un error al crear la cuenta.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cyan-400">
          Registro médico
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Crear cuenta profesional
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleRegister}>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Nombre"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Nombre"
            type="text"
            icon={<User className="h-5 w-5" />}
          />

          <InputField
            label="Apellidos"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Apellidos"
            type="text"
            icon={<User className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="DNI / NIE"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            placeholder="12345678A"
            type="text"
            icon={<BadgeCheck className="h-5 w-5" />}
          />

          <InputField
            label="Nº colegiado"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            placeholder="COL-45892"
            type="text"
            icon={<BadgeCheck className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Hospital / centro"
            name="hospital"
            value={form.hospital}
            onChange={handleChange}
            placeholder="Hospital"
            type="text"
            icon={<Building2 className="h-5 w-5" />}
          />

          <InputField
            label="Especialidad"
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            placeholder="ej: Neurología"
            type="text"
            icon={<Stethoscope className="h-5 w-5" />}
          />
        </div>

        <InputField
          label="Correo profesional"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="medico@hospital.com"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Contraseña"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Crea una contraseña"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="h-5 w-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <InputField
            label="Confirmar contraseña"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            type={showConfirmPassword ? "text" : "password"}
            icon={<Lock className="h-5 w-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-slate-400 transition hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />
        </div>

        {!passwordsMatch && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            Las contraseñas no coinciden.
          </p>
        )}

        <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
          <input
            name="accepted"
            checked={accepted}
            onChange={handleChange}
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
          />
          <span>
            Confirmo que soy personal autorizado y que usaré esta plataforma solo
            con fines clínicos o de investigación aprobados.
          </span>
        </label>

        {errorMsg && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta médica"}
        </button>
      </form>
    </div>
  );
}

function InputField({
  label,
  icon,
  rightElement,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20">
        <span className="text-slate-400">{icon}</span>

        <input
          {...props}
          className={`w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none ${
            className ?? ""
          }`}
        />

        {rightElement}
      </div>
    </div>
  );
}