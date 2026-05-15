import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export type SessionMetric = {
  sessionId: string;
  sessionLabel: string;
  startedAt: string;

  sessionType: string;
  durationSeconds: number | null;
  score: number | null;
  incidents: string | null;
  notes: string | null;

  meanDetection: number | null;

  omissionsLeft: number | null;
  omissionsRight: number | null;
  detectionRate: number | null;
  precisionLeft: number | null;
  precisionRight: number | null;

  totalLeft: number | null;
  totalRight: number | null;
  leftDetections: number | null;
  rightDetections: number | null;
};

type MetricsPanelProps = {
  data: SessionMetric[];
  loading?: boolean;
};

function isValidNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function formatPercent(value: number | null | undefined) {
  if (!isValidNumber(value)) return "--";

  const rounded = Number(value.toFixed(1));
  return `${rounded}%`;
}

function formatNumber(value: number | null | undefined) {
  if (!isValidNumber(value)) return "--";
  return value;
}

function formatMs(value: number | null | undefined) {
  if (!isValidNumber(value)) return "--";
  return `${Math.round(value)} ms`;
}

function getAverage(
  data: SessionMetric[],
  key: keyof Pick<
    SessionMetric,
    "detectionRate" | "precisionLeft" | "precisionRight" | "meanDetection"
  >
) {
  const validValues = data.map((item) => item[key]).filter(isValidNumber);

  if (validValues.length === 0) return null;

  return validValues.reduce((acc, value) => acc + value, 0) / validValues.length;
}

export default function MetricsPanel({
  data,
  loading = false,
}: MetricsPanelProps) {
  const latest = data.length > 0 ? data[data.length - 1] : null;

  const avgDetectionRate = getAverage(data, "detectionRate");
  const avgPrecisionLeft = getAverage(data, "precisionLeft");
  const avgPrecisionRight = getAverage(data, "precisionRight");
  const avgMeanDetection = getAverage(data, "meanDetection");

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Evolución</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tendencia del rendimiento clínico del paciente a lo largo de las
          sesiones registradas.
        </p>
      </div>

      {/* RESUMEN DE LA ÚLTIMA SESIÓN */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Última sesión registrada
          </h3>
          <p className="text-sm text-gray-500">
            Valores principales de la sesión más reciente con métricas válidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <SummaryCard
            title="Tasa de detección"
            value={latest ? formatPercent(latest.detectionRate) : "--"}
          />

          <SummaryCard
            title="Tiempo medio detección"
            value={latest ? formatMs(latest.meanDetection) : "--"}
          />

          <SummaryCard
            title="Omisiones izquierda"
            value={latest ? String(formatNumber(latest.omissionsLeft)) : "--"}
          />

          <SummaryCard
            title="Omisiones derecha"
            value={latest ? String(formatNumber(latest.omissionsRight)) : "--"}
          />

          <SummaryCard
            title="Precisión izquierda"
            value={latest ? formatPercent(latest.precisionLeft) : "--"}
          />

          <SummaryCard
            title="Precisión derecha"
            value={latest ? formatPercent(latest.precisionRight) : "--"}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Métricas resumidas
          </h3>
          <p className="text-sm text-gray-500">
            Promedios globales calculados sobre las sesiones con métricas
            válidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Precisión media izquierda"
            value={formatPercent(avgPrecisionLeft)}
          />

          <SummaryCard
            title="Precisión media derecha"
            value={formatPercent(avgPrecisionRight)}
          />

          <SummaryCard
            title="Tasa media de detección"
            value={formatPercent(avgDetectionRate)}
          />

          <SummaryCard
            title="Tiempo medio detección"
            value={formatMs(avgMeanDetection)}
          />
        </div>
      </div>

      {/* GRÁFICAS DE EVOLUCIÓN */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* TASA DE DETECCIÓN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Tasa de detección por sesión
            </h3>
            <p className="text-sm text-gray-500">
              Evolución del porcentaje de estímulos detectados.
            </p>
          </div>

          <div className="w-full h-[320px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="detectionRate"
                    name="Tasa de detección"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </div>

        {/* TIEMPO MEDIO DE DETECCIÓN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Tiempo medio de detección
            </h3>
            <p className="text-sm text-gray-500">
              Evolución del tiempo medio de respuesta por sesión.
            </p>
          </div>

          <div className="w-full h-[320px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="meanDetection"
                    name="Tiempo medio detección"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </div>

        {/* OMISIONES POR LADO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Omisiones por lado
            </h3>
            <p className="text-sm text-gray-500">
              Comparativa de omisiones izquierda y derecha por sesión.
            </p>
          </div>

          <div className="w-full h-[320px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
  dataKey="omissionsLeft"
  name="Izquierda"
  fill="#14b8a6"
/>

<Bar
  dataKey="omissionsRight"
  name="Derecha"
  fill="#6366f1"
/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </div>

        {/* PRECISIÓN POR LADO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Precisión por lado visual
            </h3>
            <p className="text-sm text-gray-500">
              Comparativa de precisión izquierda y derecha por sesión.
            </p>
          </div>

          <div className="w-full h-[320px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
               <Bar
  dataKey="precisionLeft"
  name="Izquierda"
  fill="#14b8a6"
/>

<Bar
  dataKey="precisionRight"
  name="Derecha"
  fill="#6366f1"
/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </div>
      </div>

      {/* PROMEDIOS GLOBALES */}
      
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
};

function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-gray-400">
      No hay datos disponibles
    </div>
  );
}