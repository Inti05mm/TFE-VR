import type { SessionMetric } from "./MetricsPanel";

type PatientSessionProps = {
  data: SessionMetric[];
  loading?: boolean;
  onViewDetail?: (sessionId: string) => void;
};

export default function PatientSession({
  data,
  loading = false,
  onViewDetail,
}: PatientSessionProps) {
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSessionType = (type: string) => {
    switch (type) {
      case "vr_assessment":
        return "Evaluación VR";
      case "vr_training":
        return "Entrenamiento VR";
      case "visual_search":
        return "Búsqueda visual";
      case "extinction_test":
        return "Test de extinción";
      case "custom":
        return "Personalizado";
      default:
        return type || "-";
    }
  };

  const getSessionTypeClasses = (type: string) => {
    switch (type) {
      case "vr_assessment":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "vr_training":
        return "bg-green-50 text-green-700 border border-green-200";
      case "visual_search":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "extinction_test":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const formatDuration = (durationSeconds: number | null) => {
    if (!durationSeconds || durationSeconds <= 0) return "-";

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes} min`;

    return `${minutes} min ${seconds}s`;
  };

  const formatScore = (score: number | null) => {
    if (score === null || score === undefined) return "-";
    return Number(score).toFixed(1);
  };

  const formatIncidents = (incidents: string | null) => {
    if (!incidents || incidents.trim() === "") return "Sin incidencias";
    return incidents;
  };

  const getIncidentsCount = (incidents: string | null) => {
    if (!incidents || incidents.trim() === "") return 0;
    return incidents
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean).length;
  };

  const safeNumber = (value: number | null | undefined, fallback = "-") => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return fallback;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cargando sesiones...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Sesiones</h2>
        <p className="text-gray-500 mt-1">
          Historial de sesiones realizadas y resumen clínico de cada una.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1150px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="py-3 pr-4 font-semibold">Sesión</th>
              <th className="py-3 pr-4 font-semibold">Fecha</th>
              <th className="py-3 pr-4 font-semibold">Tipo</th>
              <th className="py-3 pr-4 font-semibold">Duración</th>
              <th className="py-3 pr-4 font-semibold">Puntuación</th>
              <th className="py-3 pr-4 font-semibold">Detección media</th>
              <th className="py-3 pr-4 font-semibold">Omisiones izq.</th>
              <th className="py-3 pr-4 font-semibold">Omisiones der.</th>
              <th className="py-3 pr-4 font-semibold">Bias</th>
              <th className="py-3 pr-4 font-semibold">Incidencias</th>
              <th className="py-3 pr-4 font-semibold text-center">Acción</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.sessionId}
                  className="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {item.sessionLabel}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {formatDateTime(item.startedAt)}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getSessionTypeClasses(
                        item.sessionType
                      )}`}
                    >
                      {formatSessionType(item.sessionType)}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    {formatDuration(item.durationSeconds)}
                  </td>

                  <td className="py-4 pr-4 font-semibold text-gray-800">
                    {formatScore(item.score)}
                  </td>

                  <td className="py-4 pr-4">
                    {item.meanDetection !== null &&
                    item.meanDetection !== undefined
                      ? `${Math.round(item.meanDetection)} ms`
                      : "-"}
                  </td>

                  <td className="py-4 pr-4">
                    {safeNumber(item.omissionsLeft)}
                  </td>

                  <td className="py-4 pr-4">
                    {safeNumber(item.omissionsRight)}
                  </td>

                  <td className="py-4 pr-4">
                    {item.explorationBias !== null &&
                    item.explorationBias !== undefined
                      ? item.explorationBias.toFixed(2)
                      : "-"}
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">
                        {getIncidentsCount(item.incidents)} incid.
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[220px]">
                        {formatIncidents(item.incidents)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 pr-4 text-center">
                    <button
                      onClick={() => onViewDetail?.(item.sessionId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  No hay sesiones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}