import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import MetricsPanel, { type SessionMetric } from "./MetricsPanel";
import PatientSession from "./PatientSession";

type SessionMetricsRow = {
  mean_detection_latency_ms: number | null;
  omissions_left: number | null;
  omissions_right: number | null;
  detection_rate: number | null;
  precision_left: number | null;
  precision_right: number | null;

  hit_left: number | null;
  hit_right: number | null;
  total_left: number | null;
  total_right: number | null;
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

function hasValidMetrics(metrics: SessionMetricsRow | null) {
  if (!metrics) return false;

  return (
    metrics.detection_rate !== null &&
    metrics.detection_rate !== undefined &&
    metrics.precision_left !== null &&
    metrics.precision_left !== undefined &&
    metrics.precision_right !== null &&
    metrics.precision_right !== undefined
  );
}

function toNumberOrNull(value: number | null | undefined) {
  return value !== null && value !== undefined ? Number(value) : null;
}

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
            detection_rate,
            precision_left,
            precision_right,
            hit_left,
            hit_right,
            total_left,
            total_right
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

      const formattedAll: SessionMetric[] = (
        (sessionsData ?? []) as SessionRow[]
      ).map((item, index) => {
        const metrics = Array.isArray(item.session_metrics)
          ? item.session_metrics[0] ?? null
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

          meanDetection: toNumberOrNull(metrics?.mean_detection_latency_ms),

          omissionsLeft: metrics?.omissions_left ?? null,
          omissionsRight: metrics?.omissions_right ?? null,
          detectionRate: toNumberOrNull(metrics?.detection_rate),
          precisionLeft: toNumberOrNull(metrics?.precision_left),
          precisionRight: toNumberOrNull(metrics?.precision_right),

          totalLeft: metrics?.total_left ?? null,
          totalRight: metrics?.total_right ?? null,
          leftDetections: metrics?.hit_left ?? null,
          rightDetections: metrics?.hit_right ?? null,
        };
      });

      if (mode === "metrics") {
        const formattedForMetrics = ((sessionsData ?? []) as SessionRow[])
          .map((item) => {
            const metrics = Array.isArray(item.session_metrics)
              ? item.session_metrics[0] ?? null
              : item.session_metrics;

            if (!hasValidMetrics(metrics)) return null;

            return {
              sessionId: item.id,
              sessionLabel: "",
              startedAt: item.started_at,

              sessionType: item.session_type,
              durationSeconds: item.duration_seconds,
              score: item.score,
              incidents: item.incidents,
              notes: item.notes,

              meanDetection: toNumberOrNull(metrics?.mean_detection_latency_ms),

              omissionsLeft: metrics?.omissions_left ?? null,
              omissionsRight: metrics?.omissions_right ?? null,
              detectionRate: toNumberOrNull(metrics?.detection_rate),
              precisionLeft: toNumberOrNull(metrics?.precision_left),
              precisionRight: toNumberOrNull(metrics?.precision_right),

              totalLeft: metrics?.total_left ?? null,
              totalRight: metrics?.total_right ?? null,
              leftDetections: metrics?.hit_left ?? null,
              rightDetections: metrics?.hit_right ?? null,
            } as SessionMetric;
          })
          .filter((item): item is SessionMetric => item !== null)
          .reverse()
          .map((item, index) => ({
            ...item,
            sessionLabel: `S${index + 1}`,
          }));

        setData(formattedForMetrics);
      } else {
        setData(formattedAll);
      }

      setLoading(false);
    };

    if (!patientId) {
      setData([]);
      setLoading(false);
      return;
    }

    fetchMetrics();
  }, [patientId, mode]);

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