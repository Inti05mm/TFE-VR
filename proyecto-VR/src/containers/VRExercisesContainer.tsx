import { useState } from "react";

type VRExercisesContainerProps = {
  patientId: string;
  patientName?: string;
};

type Exercise = {
  id: string;
  title: string;
  description?: string;
  recommendedFor?: string;
  duration?: string;
  available: boolean;
};

export default function VRExercisesContainer({
  patientId,
  patientName,
}: VRExercisesContainerProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [unityOpen, setUnityOpen] = useState(false);

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
    setUnityOpen(true);
  };

  const unityUrl = selectedExercise
    ? "http://localhost:5173/web3/index.html"
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
            <span className="font-semibold">{patientName || patientId}</span>
          </p>
        </div>
      </div>

      {!unityOpen && (
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