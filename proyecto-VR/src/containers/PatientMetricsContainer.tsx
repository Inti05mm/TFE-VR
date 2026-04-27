import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import MetricsPanel, { type SessionMetric } from "./MetricsPanel";
import PatientSession from "./PatientSession";

type SessionMetricsRow = {
  mean_detection_latency_ms: number | null;
  omissions_left: number | null;
  omissions_right: number | null;
  exploration_bias_score: number | null;
  detection_rate: number | null;
  precision_left: number | null;
  precision_center: number | null;
  precision_right: number | null;
};

type SessionRow = {
  id: string;
  started_at: string;
  session_type: string;
  duration_seconds: number | null;
  score: number | null;
  incidents: string | null;
  notes: string | null;
  session_metrics: SessionMetricsRow | SessionMetricsRow[] | null;
};

type PatientMetricsContainerProps = {
  patientId: string;
  mode: "metrics" | "sessions";
  onViewDetail?: (sessionId: string) => void;
};

export default function PatientMetricsContainer({
  patientId,
  mode,
  onViewDetail,
}: PatientMetricsContainerProps) {
  const [data, setData] = useState<SessionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);

      const { data: sessionsData, error } = await supabase
        .from("sessions")
        .select(
          `
          id,
          started_at,
          session_type,
          duration_seconds,
          score,
          incidents,
          notes,
          session_metrics (
            mean_detection_latency_ms,
            omissions_left,
            omissions_right,
            exploration_bias_score,
            detection_rate,
            precision_left,
            precision_center,
            precision_right
          )
        `
        )
        .eq("patient_id", patientId)
        .order("started_at", { ascending: false });

console.log("PATIENT ID:", patientId);
console.log("SESSIONS DATA:", sessionsData);
console.log("ERROR:", error);

      if (error) {
        console.error("Error cargando métricas del paciente:", error);
        setData([]);
        setLoading(false);
        return;
      }

      const formatted: SessionMetric[] = ((sessionsData ?? []) as SessionRow[]).map(
        (item, index) => {
          const metrics = Array.isArray(item.session_metrics)
            ? item.session_metrics[0]
            : item.session_metrics;

          return {
            sessionId: item.id,
            sessionLabel: `S${index + 1}`,
            startedAt: item.started_at,

            sessionType: item.session_type,
            durationSeconds: item.duration_seconds,
            score: item.score,
            incidents: item.incidents,
            notes: item.notes,

            meanDetection: metrics?.mean_detection_latency_ms ?? 0,
            omissionsLeft: metrics?.omissions_left ?? 0,
            omissionsRight: metrics?.omissions_right ?? 0,
            explorationBias: metrics?.exploration_bias_score ?? 0,
            detectionRate: Number(metrics?.detection_rate ?? 0),
            precisionLeft: Number(metrics?.precision_left ?? 0),
            precisionCenter: Number(metrics?.precision_center ?? 0),
            precisionRight: Number(metrics?.precision_right ?? 0),
          };
        }
      );

      setData(formatted);
      setLoading(false);
    };

    if (!patientId) {
      setData([]);
      setLoading(false);
      return;
    }

    fetchMetrics();
  }, [patientId]);

  if (mode === "sessions") {
    return (
      <PatientSession
        data={data}
        loading={loading}
        onViewDetail={onViewDetail}
      />
    );
  }

  return <MetricsPanel data={data} loading={loading} />;
}