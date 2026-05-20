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

type VRExercisesContainerProps = {
  patientId: string;
  patientName?: string;
  patientNeglectSide?: string | null;
  patientSeverity?: number | null;
};

const API_URL = "http://10.161.202.146:8000";
const FRONTEND_URL = "http://10.161.202.146:5173";

export default function VRExercisesContainer({
  patientId,
  patientName,
  patientNeglectSide,
  patientSeverity,
}: VRExercisesContainerProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const [unityUrl, setUnityUrl] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

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

  const createQR = async () => {
    try {
      setLoadingQR(true);
      setError("");
      setUnityUrl("");
      setQrToken("");
      setExpiresAt("");

      if (!patientId) {
        throw new Error("No se ha encontrado el paciente seleccionado.");
      }

      const qrResponse = await fetch(`${API_URL}/qr-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientId,
        }),
      });

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo generar el QR.");
      }

      const qrData = await qrResponse.json();

      const token = qrData.qr_token;

      const finalUnityUrl = `${FRONTEND_URL}/open-session?qr_token=${encodeURIComponent(
        token
      )}`;

      setQrToken(token);
      setUnityUrl(finalUnityUrl);
      setExpiresAt(qrData.expires_at);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al generar el QR.");
      }
    } finally {
      setLoadingQR(false);
    }
  };

  const startExercise = async (exercise: Exercise) => {
    if (!exercise.available) return;

    setSelectedExercise(exercise);
    setUnityUrl("");
    setQrToken("");
    setExpiresAt("");
    setError("");

    await createQR();
  };

  const regenerateQR = async () => {
    await createQR();
  };

  const closeFlow = () => {
    setSelectedExercise(null);
    setUnityUrl("");
    setQrToken("");
    setExpiresAt("");
    setError("");
    setLoadingQR(false);
  };

  const formatNeglectSide = (side?: string | null) => {
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

  const formatSeverity = (severity?: number | null) => {
    switch (severity) {
      case 1:
        return "Leve";
      case 2:
        return "Moderado";
      case 3:
        return "Severo";
      default:
        return "No especificada";
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Ejercicios VR
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Selecciona un ejercicio para generar directamente un QR de acceso a las
          gafas.
        </p>

        {patientName && (
          <p className="text-sm text-gray-600 mt-3">
            Paciente:{" "}
            <span className="font-semibold text-gray-800">{patientName}</span>
          </p>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {!selectedExercise && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between min-h-[230px]"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {exercise.title}
                </h3>

                {exercise.available ? (
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
                ) : (
                  <p className="text-sm text-gray-400 mt-2">
                    Este ejercicio todavía no está disponible.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => startExercise(exercise)}
                disabled={!exercise.available || loadingQR}
                className={`mt-5 w-full font-medium py-2.5 rounded-xl transition ${
                  exercise.available
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loadingQR && selectedExercise?.id === exercise.id
                  ? "Generando QR..."
                  : exercise.available
                  ? "Iniciar ejercicio"
                  : "No disponible"}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedExercise && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedExercise.title}
              </h3>

              <p className="text-sm text-gray-500">
                Se está generando una sesión temporal para abrir el ejercicio en
                las gafas.
              </p>
            </div>

            <button
              type="button"
              onClick={closeFlow}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Cerrar
            </button>
          </div>

          {loadingQR && !unityUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-gray-600">
              Generando QR para la sesión...
            </div>
          )}

          {unityUrl && (
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
                    Caduca: {new Date(expiresAt).toLocaleString("es-ES")}
                  </p>
                )}
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
                      {patientName || patientId}
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
                      {formatNeglectSide(patientNeglectSide)}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Severidad:
                    </span>{" "}
                    <span className="text-gray-600">
                      {formatSeverity(patientSeverity)}
                    </span>
                  </p>
                </div>

                <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">URL generada:</p>

                  <p className="text-xs font-mono break-all text-gray-700">
                    {unityUrl}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => window.open(unityUrl, "_blank")}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                  >
                    Abrir también en este ordenador
                  </button>

                  <button
                    type="button"
                    onClick={regenerateQR}
                    disabled={loadingQR}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingQR ? "Generando..." : "Regenerar QR"}
                  </button>
                </div>

                {qrToken && (
                  <p className="mt-4 text-xs text-gray-400 break-all">
                    Token interno generado correctamente.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}