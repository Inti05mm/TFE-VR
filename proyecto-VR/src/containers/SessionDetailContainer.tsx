type SessionParameter = {
  label: string;
  value: string | number | null;
};

type SessionEvent = {
  id: string;
  time: string;
  eventType: string;
  position?: string | null;
  result?: string | null;
  details?: string | null;
};

type SessionDetailData = {
  sessionId: string;
  sessionLabel: string;
  startedAt: string;
  sessionType: string;
  durationSeconds: number | null;
  score: number | null;
  incidents: string | null;
  meanDetection: number | null;
  omissionsLeft: number | null;
  omissionsRight: number | null;
  explorationBias: number | null;

  parameters?: SessionParameter[];

  metrics?: {
    totalStimuli?: number | null;
    detectedStimuli?: number | null;
    missedStimuli?: number | null;

    totalLeft?: number | null;
    totalRight?: number | null;
    leftDetections?: number | null;
    rightDetections?: number | null;

    reactionTimeMin?: number | null;
    reactionTimeMax?: number | null;

    accuracy?: number | null;
    precisionLeft?: number | null;
    precisionRight?: number | null;
  };

  events?: SessionEvent[];
  doctorNotes?: string | null;
};

type SessionDetailContainerProps = {
  session: SessionDetailData | null;
  loading?: boolean;
  onBack?: () => void;
};

export default function SessionDetailContainer({
  session,
  loading = false,
  onBack,
}: SessionDetailContainerProps) {
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
  const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Number(value).toFixed(2)}%`;
};

  const formatValue = (
    value: string | number | null | undefined,
    suffix = ""
  ) => {
    if (value === null || value === undefined || value === "") return "-";
    return `${value}${suffix}`;
  };

  const parseIncidents = (incidents: string | null) => {
    if (!incidents || incidents.trim() === "") return [];

    return incidents
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cargando detalle de la sesión...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <p className="text-sm text-gray-500">No se ha encontrado la sesión.</p>
      </div>
    );
  }

  const incidentsList = parseIncidents(session.incidents);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              ← Volver a sesiones
            </button>

            <h2 className="text-2xl font-semibold text-gray-800">
              {session.sessionLabel}
            </h2>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {formatDateTime(session.startedAt)}
              </span>

              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {formatSessionType(session.sessionType)}
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Duración: {formatDuration(session.durationSeconds)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 min-w-[180px]">
            <p className="text-sm text-blue-700 font-medium">Puntuación final</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">
              {session.score != null ? formatScore(session.score * 2) : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* RESUMEN CLÍNICO */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-gray-800">
            Resumen clínico
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Indicadores principales obtenidos en esta sesión.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <SummaryCard title="Puntuación" value={formatScore(session.score)} />

          

          <SummaryCard
            title="Omisiones izq."
            value={formatValue(session.omissionsLeft)}
          />

          <SummaryCard
            title="Omisiones der."
            value={formatValue(session.omissionsRight)}
          />

        

          <SummaryCard title="Incidencias" value={String(incidentsList.length)} />
        </div>
      </div>

      {/* PARÁMETROS */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-gray-800">
            Parámetros de la sesión
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configuración usada durante la ejecución.
          </p>
        </div>

        {session.parameters && session.parameters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {session.parameters.map((param, index) => (
              <div
                key={`${param.label}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {param.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {formatValue(param.value)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No hay parámetros registrados para esta sesión.
          </p>
        )}
      </div>

      {/* MÉTRICAS DETALLADAS */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-gray-800">
            Métricas detalladas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Resultados extendidos de rendimiento y exploración visual.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="py-3 pr-4 font-semibold">Métrica</th>
                <th className="py-3 pr-4 font-semibold">Valor</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              <MetricRow
                label="Estímulos totales"
                value={formatValue(session.metrics?.totalStimuli)}
              />

              <MetricRow
                label="Estímulos detectados"
                value={formatValue(session.metrics?.detectedStimuli)}
              />

              <MetricRow
                label="Estímulos omitidos"
                value={formatValue(session.metrics?.missedStimuli)}
              />

              <MetricRow
                label="Soles generados en lado izquierdo"
                value={formatValue(session.metrics?.totalLeft)}
              />

              <MetricRow
                label="Soles clicados en lado izquierdo"
                value={formatValue(session.metrics?.leftDetections)}
              />

              <MetricRow
                label="Soles generados en lado derecho"
                value={formatValue(session.metrics?.totalRight)}
              />

              <MetricRow
                label="Soles clicados en lado derecho"
                value={formatValue(session.metrics?.rightDetections)}
              />

              <MetricRow
                label="Tiempo de reacción mínimo"
                value={formatValue(session.metrics?.reactionTimeMin, " ms")}
              />

              <MetricRow
                label="Tiempo de reacción máximo"
                value={formatValue(session.metrics?.reactionTimeMax, " ms")}
              />

              <MetricRow
  label="Precisión izquierda"
  value={formatPercent(session.metrics?.precisionLeft)}
/>

<MetricRow
  label="Precisión derecha"
  value={formatPercent(session.metrics?.precisionRight)}
/>

<MetricRow
  label="Tasa de detección global"
  value={formatPercent(session.metrics?.accuracy)}
/>
            </tbody>
          </table>
        </div>
      </div>


      {/* INCIDENCIAS Y OBSERVACIONES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Incidencias</h3>
            <p className="text-sm text-gray-500 mt-1">
              Incidentes clínicos o técnicos asociados a la sesión.
            </p>
          </div>

          {incidentsList.length > 0 ? (
            <ul className="space-y-3">
              {incidentsList.map((incident, index) => (
                <li
                  key={`${incident}-${index}`}
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {incident}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Sin incidencias registradas.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Observaciones del médico
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Notas clínicas y comentarios cualitativos de la sesión.
            </p>
          </div>

          {session.doctorNotes && session.doctorNotes.trim() !== "" ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-line">
              {session.doctorNotes}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No hay observaciones médicas registradas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
};

function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}

type MetricRowProps = {
  label: string;
  value: string;
};

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-4 font-medium">{label}</td>
      <td className="py-3 pr-4">{value}</td>
    </tr>
  );
}