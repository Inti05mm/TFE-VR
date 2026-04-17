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

  meanDetection: number;
  omissionsLeft: number;
  omissionsRight: number;
  explorationBias: number;
  detectionRate: number;
  precisionLeft: number;
  precisionCenter: number;
  precisionRight: number;
};

type MetricsPanelProps = {
  data: SessionMetric[];
  loading?: boolean;
};

export default function MetricsPanel({
  data,
  loading = false,
}: MetricsPanelProps) {
  const latest = data.length > 0 ? data[data.length - 1] : null;

  const avgDetectionRate =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.detectionRate, 0) / data.length
      : 0;

  const avgPrecisionLeft =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.precisionLeft, 0) / data.length
      : 0;

  const avgPrecisionCenter =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.precisionCenter, 0) / data.length
      : 0;

  const avgPrecisionRight =
    data.length > 0
      ? data.reduce((acc, item) => acc + item.precisionRight, 0) / data.length
      : 0;

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Evolución</h2>
        <p className="text-sm text-gray-500 mt-1">
          Análisis clínico y evolución del rendimiento por sesión
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Tiempo medio de reacción</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? `${Math.round(latest.meanDetection)} ms` : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Tasa de detección</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? `${latest.detectionRate.toFixed(1)}%` : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Omisiones izquierda</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? latest.omissionsLeft : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Omisiones derecha</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? latest.omissionsRight : "--"}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Precisión izquierda</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? `${latest.precisionLeft.toFixed(1)}%` : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Precisión centro</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? `${latest.precisionCenter.toFixed(1)}%` : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Precisión derecha</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? `${latest.precisionRight.toFixed(1)}%` : "--"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Sesgo exploratorio</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {latest ? latest.explorationBias.toFixed(2) : "--"}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Evolución del tiempo de reacción
            </h3>
            <p className="text-sm text-gray-500">
              Comparación del tiempo medio por sesión
            </p>
          </div>

          <div className="w-full h-[300px]">
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
                    name="Tiempo reacción"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Tasa de detección por sesión
            </h3>
            <p className="text-sm text-gray-500">
              Evolución del porcentaje de detección
            </p>
          </div>

          <div className="w-full h-[300px]">
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
                    name="Tasa detección"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Omisiones por lado
            </h3>
            <p className="text-sm text-gray-500">
              Comparativa izquierda vs derecha por sesión
            </p>
          </div>

          <div className="w-full h-[300px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="omissionsLeft" name="Izquierda" />
                  <Bar dataKey="omissionsRight" name="Derecha" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Precisión por lado visual
            </h3>
            <p className="text-sm text-gray-500">
              Comparativa izquierda, centro y derecha
            </p>
          </div>

          <div className="w-full h-[300px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sessionLabel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="precisionLeft" name="Izquierda" />
                  <Bar dataKey="precisionCenter" name="Centro" />
                  <Bar dataKey="precisionRight" name="Derecha" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Métricas resumidas
          </h3>
          <p className="text-sm text-gray-500">
            Promedio global del rendimiento acumulado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Precisión media izquierda</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {data.length > 0 ? `${avgPrecisionLeft.toFixed(1)}%` : "--"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Precisión media centro</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {data.length > 0 ? `${avgPrecisionCenter.toFixed(1)}%` : "--"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Precisión media derecha</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {data.length > 0 ? `${avgPrecisionRight.toFixed(1)}%` : "--"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 md:col-span-3">
            <p className="text-sm text-gray-500">Tasa media de detección</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {data.length > 0 ? `${avgDetectionRate.toFixed(1)}%` : "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}