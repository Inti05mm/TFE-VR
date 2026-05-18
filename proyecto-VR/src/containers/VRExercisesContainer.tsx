import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Exercise = {
  id: string;
  title: string;
  description?: string;
  recommendedFor?: string;
  duration?: string;
  available: boolean;
};

type LoggedPatient = {
  patient_id: string;
  first_name: string;
  last_name?: string;
  neglect_side?: string;
  severity?: number;
};

const API_URL = "http://10.40.14.94:8000";
const WEBGL_URL = "http://10.16.86.146:5173/web3/index.html";

export default function VRExercisesContainer() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const [showLogin, setShowLogin] = useState(false);

  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");

  const [patient, setPatient] = useState<LoggedPatient | null>(null);

  const [unityUrl, setUnityUrl] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [error, setError] = useState("");

  const exercises: Exercise[] = [
    {
      id: "vr_assessment",
      title: "Ejercicio 1. Evaluación VR",
      description:
        "Sesión general para evaluar el rendimiento visual del paciente.",
      recommendedFor: "Primera valoración o seguimiento general",
      duration: "5-10 min",
      available: true,
    },
    {
      id: "exercise_2",
      title: "Ejercicio 2",
      available: false,
    },
    {
      id: "exercise_3",
      title: "Ejercicio 3",
      available: false,
    },
  ];

  const startExercise = (exercise: Exercise) => {
    if (!exercise.available) {
      return;
    }

    setSelectedExercise(exercise);
    setShowLogin(true);

    setPatient(null);
    setUnityUrl("");
    setQrToken("");
    setExpiresAt("");
    setError("");
    setDni("");
    setPassword("");
  };

  const loginAndCreateQR = async () => {
    if (!selectedExercise) {
      return;
    }

    try {
      setLoadingLogin(true);
      setLoadingQR(false);
      setError("");
      setUnityUrl("");
      setQrToken("");
      setExpiresAt("");
      setPatient(null);

      /*
        1. Login del paciente
        Endpoint existente en tu backend:
        POST /patients/login
      */
      const loginResponse = await fetch(`${API_URL}/patients/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni,
          password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.detail || "DNI o contraseña incorrectos");
      }

      const loginData: LoggedPatient = await loginResponse.json();

      setPatient(loginData);
      setLoadingLogin(false);
      setLoadingQR(true);

      /*
        2. Crear sesión QR temporal
        Endpoint nuevo:
        POST /qr-sessions
      */
      const qrResponse = await fetch(`${API_URL}/qr-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: loginData.patient_id,
        }),
      });

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json();
        throw new Error(errorData.detail || "No se pudo generar el QR");
      }

      const qrData = await qrResponse.json();

      const token = qrData.qr_token;

      /*
        URL final que se mete dentro del QR.
        Las gafas abrirán esta URL.
      */
    const finalUnityUrl = `http://10.40.14.94:5173/open-session?qr_token=${encodeURIComponent(token)}`;

      setQrToken(token);
      setUnityUrl(finalUnityUrl);
      setExpiresAt(qrData.expires_at);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al iniciar el ejercicio");
      }
    } finally {
      setLoadingLogin(false);
      setLoadingQR(false);
    }
  };

  const closeFlow = () => {
    setSelectedExercise(null);
    setShowLogin(false);

    setDni("");
    setPassword("");
    setPatient(null);

    setUnityUrl("");
    setQrToken("");
    setExpiresAt("");
    setError("");

    setLoadingLogin(false);
    setLoadingQR(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Ejercicios VR
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Selecciona un ejercicio, inicia sesión con el paciente y genera un QR
          para abrir el juego en las gafas.
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {!showLogin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exercises.map((exercise) => {
            return (
              <div
                key={exercise.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between min-h-[230px]"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {exercise.title}
                  </h3>

                  {exercise.available && (
                    <>
                      <p className="text-sm text-gray-500 mt-2">
                        {exercise.description}
                      </p>

                      <div className="mt-4 space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-gray-700">
                            Recomendado:
                          </span>{" "}
                          <span className="text-gray-500">
                            {exercise.recommendedFor}
                          </span>
                        </p>

                        <p>
                          <span className="font-medium text-gray-700">
                            Duración:
                          </span>{" "}
                          <span className="text-gray-500">
                            {exercise.duration}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => startExercise(exercise)}
                  disabled={!exercise.available}
                  className={`mt-5 w-full font-medium py-2.5 rounded-xl transition ${
                    exercise.available
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {exercise.available ? "Iniciar ejercicio" : "No disponible"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showLogin && selectedExercise && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedExercise.title}
              </h3>

              <p className="text-sm text-gray-500">
                Inicia sesión con el paciente para generar el QR de acceso a las
                gafas.
              </p>
            </div>

            <button
              onClick={closeFlow}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Cerrar
            </button>
          </div>

          {!unityUrl && (
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>

                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Introduce el DNI"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce la contraseña"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={loginAndCreateQR}
                disabled={loadingLogin || loadingQR || !dni || !password}
                className={`w-full font-medium py-2.5 rounded-xl transition ${
                  loadingLogin || loadingQR || !dni || !password
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loadingLogin
                  ? "Validando paciente..."
                  : loadingQR
                  ? "Generando QR..."
                  : "Crear QR para gafas"}
              </button>
            </div>
          )}

          {unityUrl && patient && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              <div className="border border-gray-200 rounded-2xl p-5 flex flex-col items-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  QR para las gafas
                </h4>

                <p className="text-sm text-gray-500 text-center mb-4">
                  Escanea este QR desde las gafas para abrir el juego con este
                  paciente.
                </p>

                <QRCodeCanvas
                  value={unityUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                />

                {expiresAt && (
                  <p className="text-xs text-gray-500 mt-4">
                    Caduca: {new Date(expiresAt).toLocaleString()}
                  </p>
                )}

                <p className="text-xs font-mono break-all mt-3 text-gray-500">
                  Token: {qrToken}
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5">
                <h4 className="text-lg font-semibold text-gray-800">
                  Sesión preparada
                </h4>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">
                      Paciente:
                    </span>{" "}
                    <span className="text-gray-600">
                      {patient.first_name} {patient.last_name ?? ""}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Ejercicio:
                    </span>{" "}
                    <span className="text-gray-600">
                      {selectedExercise.title}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Lado neglect:
                    </span>{" "}
                    <span className="text-gray-600">
                      {patient.neglect_side ?? "left"}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Severidad:
                    </span>{" "}
                    <span className="text-gray-600">
                      {patient.severity ?? 1}
                    </span>
                  </p>
                </div>

                <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    URL generada:
                  </p>

                  <p className="text-xs font-mono break-all text-gray-700">
                    {unityUrl}
                  </p>
                </div>

                <button
                  onClick={() => window.open(unityUrl, "_blank")}
                  className="mt-5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                >
                  Abrir también en este ordenador
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}