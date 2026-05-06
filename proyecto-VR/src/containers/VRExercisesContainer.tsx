import { useState } from "react";

type VRExercisesContainerProps = {
  patientId: string;
  patientName?: string;
};

type Exercise = {
  id: string;
  title: string;
  description: string;
  recommendedFor: string;
  duration: string;
};

export default function VRExercisesContainer({
  patientId,
  patientName,
}: VRExercisesContainerProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [unityOpen, setUnityOpen] = useState(false);

  const exercises: Exercise[] = [
    {
      id: "vr_assessment",
      title: "Evaluación VR",
      description:
        "Sesión general para evaluar el rendimiento visual del paciente.",
      recommendedFor: "Primera valoración o seguimiento general",
      duration: "5-10 min",
    },
    {
      id: "visual_search",
      title: "Búsqueda visual",
      description:
        "Ejercicio centrado en localizar estímulos visuales en diferentes lados.",
      recommendedFor: "Negligencia espacial y exploración visual",
      duration: "5-8 min",
    },
    {
      id: "extinction_test",
      title: "Test de extinción",
      description:
        "Evaluación de respuesta ante estímulos simultáneos o laterales.",
      recommendedFor: "Detección de omisiones y asimetrías",
      duration: "3-6 min",
    },
  ];

  const startExercise = (exercise: Exercise) => {
    if (exercise.id !== "vr_assessment") {
      return;
    }

    setSelectedExercise(exercise);
    setUnityOpen(true);
  };

const unityUrl = selectedExercise
  ? `${window.location.origin}/web3/index.html`
  : "";

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Ejercicios VR
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Selecciona un ejercicio para iniciar una sesión VR del paciente.
        </p>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            Paciente seleccionado:{" "}
            <span className="font-semibold">
              {patientName || patientId}
            </span>
          </p>
        </div>
      </div>

      {!unityOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exercises.map((exercise) => {
            const isFirstExercise = exercise.id === "vr_assessment";

            return (
              <div
                key={exercise.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {exercise.title}
                  </h3>

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
                      <span className="text-gray-500">{exercise.duration}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => startExercise(exercise)}
                  disabled={!isFirstExercise}
                  className={`mt-5 w-full font-medium py-2.5 rounded-xl transition ${
                    isFirstExercise
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isFirstExercise ? "Iniciar ejercicio" : "No disponible"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {unityOpen && selectedExercise && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedExercise.title}
              </h3>
              <p className="text-sm text-gray-500">
                Sesión preparada para el paciente seleccionado.
              </p>
            </div>

            <button
              onClick={() => {
                setUnityOpen(false);
                setSelectedExercise(null);
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Cerrar
            </button>
          </div>

          <iframe
            src={unityUrl}
            className="w-full h-[760px] rounded-2xl border border-gray-200 bg-black"
            title="Unity VR Exercise"
            allow="fullscreen; autoplay; xr-spatial-tracking; gyroscope; accelerometer"
          />
          <p className="text-xs font-mono break-all mt-2">{unityUrl}</p>
        </div>
        
      )}
    </div>
  );
}