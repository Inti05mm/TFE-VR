import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import type { Patient } from "./PatientList";
import PatientViewHeader from "./PatientViewHeader";
import PatientDetailsContainer from "./PatientDetail";
import PatientMetricsContainer from "./PatientMetricsContainer";
import SessionDetailContainer from "./SessionDetailContainer";
import VRExercisesContainer from "./VRExercisesContainer";

type PatientTab = "details" | "metrics" | "sessions" | "vr";
type SessionView = "list" | "detail";

type SessionRow = {
  id: string;
  started_at: string;
  session_type: string;
  duration_seconds: number | null;
  score: number | null;
  incidents: string | null;
  notes: string | null;
};

type SessionMetricsRow = {
  total_trials: number;
  completed_trials: number;
  correct_trials: number;
  omitted_trials: number;
  omissions_left: number;
  omissions_right: number;
  mean_first_fixation_latency_ms: number | null;
  mean_detection_latency_ms: number | null;
  mean_search_time_ms: number | null;
  left_dwell_ratio: number | null;
  right_dwell_ratio: number | null;
  center_dwell_ratio: number | null;
  exploration_bias_score: number | null;
  extinction_index: number | null;
  neglect_severity_score: number | null;
  detection_rate: number | null;
  precision_left: number | null;
  precision_center: number | null;
  precision_right: number | null;
};

type SessionConfigRow = {
  difficulty: string | null;
  planned_stimuli: number | null;
  spatial_distribution: string | null;
  dynamic_adaptation: boolean | null;
  device: string | null;
  target_duration_seconds: number | null;
};

type TrialMetricRow = {
  detection_latency_ms: number | null;
  first_fixation_latency_ms: number | null;
  fixation_duration_ms: number | null;
  total_search_time_ms: number | null;
  fixation_count_left: number | null;
  fixation_count_right: number | null;
  fixation_count_center: number | null;
};

type TrialRow = {
  id: string;
  trial_number: number;
  exercise_type: string;
  stimulus_type: string;
  stimulus_side: string | null;
  target_label: string | null;
  started_at: string;
  ended_at: string | null;
  detected: boolean | null;
  correct: boolean | null;
  omitted: boolean | null;
  assistance_used: boolean | null;
  assistance_type: string | null;
  response_label: string | null;
  trial_metrics: TrialMetricRow | TrialMetricRow[] | null;
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
  parameters: { label: string; value: string | number }[];
  metrics: {
    totalStimuli: number;
    detectedStimuli: number;
    missedStimuli: number;
    leftDetections: number;
    rightDetections: number;
    centerDetections: number;
    reactionTimeMin: number | null;
    reactionTimeMax: number | null;
    fixationCount: number;
    accuracy: number | null;
  };
  events: {
    id: string;
    time: string;
    eventType: string;
    position: string;
    result: string;
    details: string;
  }[];
  doctorNotes: string | null;
};

type PatientProfileContainerProps = {
  patient: Patient;
  onBack: () => void;
  onStartSession?: (patient: Patient) => void;
};

export default function PatientProfileContainer({
  patient,
  onBack,
  onStartSession,
}: PatientProfileContainerProps) {
  const [activeTab, setActiveTab] = useState<PatientTab>("details");
  const [sessionView, setSessionView] = useState<SessionView>("list");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [latestSession, setLatestSession] = useState<SessionRow | null>(null);
  const [loadingLatestSession, setLoadingLatestSession] = useState(false);

  const [selectedSessionDetail, setSelectedSessionDetail] =
    useState<SessionDetailData | null>(null);
  const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);

  const formatNeglectSide = (side: Patient["neglect_side"]) => {
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

  const formatSeverity = (severity: Patient["severity"]) => {
    switch (severity) {
      case 1:
        return "Leve";
      case 2:
        return "Moderado";
      case 3:
        return "Severo";
      default:
        return "No especificado";
    }
  };

  const formatSessionType = (sessionType: string | null) => {
    switch (sessionType) {
      case "vr_assessment":
        return "Evaluación VR";
      case "vr_training":
        return "Entrenamiento VR";
      case "visual_search":
        return "Búsqueda visual";
      case "extinction_test":
        return "Test de extinción";
      case "custom":
        return "Personalizada";
      default:
        return "No especificado";
    }
  };

  const formatStimulusSide = (side: string | null) => {
    switch (side) {
      case "left":
        return "Izquierda";
      case "right":
        return "Derecha";
      case "center":
        return "Centro";
      case "bilateral":
        return "Bilateral";
      default:
        return "No especificado";
    }
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "No disponible";

    return new Date(value).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatDurationClock = (seconds: number | null) => {
    if (seconds == null) return "No disponible";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatTargetDuration = (seconds: number | null) => {
    if (seconds == null) return "No especificado";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0 && secs > 0) return `${mins} min ${secs} s`;
    if (mins > 0) return `${mins} min`;
    return `${secs} s`;
  };

  const latestSessionLabel = useMemo(() => {
    if (loadingLatestSession) return "Cargando...";
    if (!latestSession) return "Sin sesiones";

    return formatDateTime(latestSession.started_at);
  }, [latestSession, loadingLatestSession]);

  useEffect(() => {
    const loadLatestSession = async () => {
      setLoadingLatestSession(true);

      const { data, error } = await supabase
        .from("sessions")
        .select("id, started_at, session_type, duration_seconds, score, incidents, notes")
        .eq("patient_id", patient.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error cargando última sesión:", error);
        setLatestSession(null);
      } else {
        setLatestSession(data ?? null);
      }

      setLoadingLatestSession(false);
    };

    loadLatestSession();
  }, [patient.id]);

  useEffect(() => {
    const loadSessionDetail = async () => {
      if (!selectedSessionId || sessionView !== "detail") {
        setSelectedSessionDetail(null);
        return;
      }

      setLoadingSessionDetail(true);

      const [sessionRes, metricsRes, configRes, trialsRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, started_at, session_type, duration_seconds, score, incidents, notes")
          .eq("id", selectedSessionId)
          .maybeSingle(),

        supabase
          .from("session_metrics")
          .select(`
            total_trials,
            completed_trials,
            correct_trials,
            omitted_trials,
            omissions_left,
            omissions_right,
            mean_first_fixation_latency_ms,
            mean_detection_latency_ms,
            mean_search_time_ms,
            left_dwell_ratio,
            right_dwell_ratio,
            center_dwell_ratio,
            exploration_bias_score,
            extinction_index,
            neglect_severity_score,
            detection_rate,
            precision_left,
            precision_center,
            precision_right
          `)
          .eq("session_id", selectedSessionId)
          .maybeSingle(),

        supabase
          .from("session_config")
          .select(`
            difficulty,
            planned_stimuli,
            spatial_distribution,
            dynamic_adaptation,
            device,
            target_duration_seconds
          `)
          .eq("session_id", selectedSessionId)
          .maybeSingle(),

        supabase
          .from("trials")
          .select(`
            id,
            trial_number,
            exercise_type,
            stimulus_type,
            stimulus_side,
            target_label,
            started_at,
            ended_at,
            detected,
            correct,
            omitted,
            assistance_used,
            assistance_type,
            response_label,
            trial_metrics (
              detection_latency_ms,
              first_fixation_latency_ms,
              fixation_duration_ms,
              total_search_time_ms,
              fixation_count_left,
              fixation_count_right,
              fixation_count_center
            )
          `)
          .eq("session_id", selectedSessionId)
          .order("trial_number", { ascending: true }),
      ]);

      if (sessionRes.error) {
        console.error("Error cargando sesión:", sessionRes.error);
        setSelectedSessionDetail(null);
        setLoadingSessionDetail(false);
        return;
      }

      if (metricsRes.error) {
        console.error("Error cargando métricas de sesión:", metricsRes.error);
      }

      if (configRes.error) {
        console.error("Error cargando configuración de sesión:", configRes.error);
      }

      if (trialsRes.error) {
        console.error("Error cargando trials:", trialsRes.error);
      }

      const session = sessionRes.data as SessionRow | null;
      const sessionMetrics = (metricsRes.data as SessionMetricsRow | null) ?? null;
      const sessionConfig = (configRes.data as SessionConfigRow | null) ?? null;
      const trials = (trialsRes.data as TrialRow[] | null) ?? [];

      if (!session) {
        setSelectedSessionDetail(null);
        setLoadingSessionDetail(false);
        return;
      }

      const normalizedTrialMetrics = trials
        .map((trial) =>
          Array.isArray(trial.trial_metrics)
            ? trial.trial_metrics[0] ?? null
            : trial.trial_metrics
        )
        .filter((metric): metric is TrialMetricRow => metric != null);

      const detectionLatencies = normalizedTrialMetrics
        .map((tm) => tm.detection_latency_ms)
        .filter((value): value is number => value != null);

      const fixationCounts = normalizedTrialMetrics.reduce((acc, tm) => {
        const left = tm.fixation_count_left ?? 0;
        const right = tm.fixation_count_right ?? 0;
        const center = tm.fixation_count_center ?? 0;
        return acc + left + right + center;
      }, 0);

      const leftDetections = trials.filter(
        (trial) => trial.stimulus_side === "left" && trial.detected === true
      ).length;

      const rightDetections = trials.filter(
        (trial) => trial.stimulus_side === "right" && trial.detected === true
      ).length;

      const centerDetections = trials.filter(
        (trial) => trial.stimulus_side === "center" && trial.detected === true
      ).length;

      const bilateralDetections = trials.filter(
        (trial) => trial.stimulus_side === "bilateral" && trial.detected === true
      ).length;

      const totalDetected =
        leftDetections + rightDetections + centerDetections + bilateralDetections;

      const totalStimuli =
        sessionMetrics?.total_trials ??
        sessionConfig?.planned_stimuli ??
        trials.length;

      const missedStimuli =
        sessionMetrics?.omitted_trials ??
        trials.filter((trial) => trial.omitted === true).length;

      const accuracy =
        sessionMetrics?.detection_rate != null
          ? Number(sessionMetrics.detection_rate)
          : totalStimuli > 0
            ? Number(((totalDetected / totalStimuli) * 100).toFixed(2))
            : null;

      const uniqueExerciseTypes = [...new Set(trials.map((trial) => trial.exercise_type))];
      const uniqueStimulusTypes = [...new Set(trials.map((trial) => trial.stimulus_type))];

      const parameters: { label: string; value: string | number }[] = [
        { label: "Tipo de sesión", value: formatSessionType(session.session_type) },
        {
          label: "Dificultad",
          value: sessionConfig?.difficulty ?? "No especificado",
        },
        {
          label: "Número de estímulos planificados",
          value: sessionConfig?.planned_stimuli ?? "No especificado",
        },
        {
          label: "Distribución espacial",
          value: sessionConfig?.spatial_distribution ?? "No especificado",
        },
        {
          label: "Adaptación dinámica",
          value:
            sessionConfig?.dynamic_adaptation == null
              ? "No especificado"
              : sessionConfig.dynamic_adaptation
                ? "Sí"
                : "No",
        },
        {
          label: "Dispositivo",
          value: sessionConfig?.device ?? "No especificado",
        },
        {
          label: "Duración objetivo",
          value: formatTargetDuration(sessionConfig?.target_duration_seconds ?? null),
        },
        {
          label: "Ejercicios usados",
          value: uniqueExerciseTypes.join(", ") || "No disponible",
        },
        {
          label: "Tipos de estímulo",
          value: uniqueStimulusTypes.join(", ") || "No disponible",
        },
        {
          label: "Asistencia usada",
          value: trials.some((trial) => trial.assistance_used) ? "Sí" : "No",
        },
      ];

      const events = trials.map((trial) => {
        const tm = Array.isArray(trial.trial_metrics)
          ? trial.trial_metrics[0] ?? null
          : trial.trial_metrics;

        let result = "Sin registrar";
        if (trial.omitted) result = "Omisión";
        else if (trial.detected) result = "Detectado";
        else if (trial.correct === false) result = "Incorrecto";

        const detailsParts: string[] = [];

        if (tm?.detection_latency_ms != null) {
          detailsParts.push(`Tiempo de detección: ${tm.detection_latency_ms} ms`);
        }

        if (trial.assistance_used) {
          detailsParts.push(`Asistencia: ${trial.assistance_type || "Sí"}`);
        }

        if (trial.response_label) {
          detailsParts.push(`Respuesta: ${trial.response_label}`);
        }

        if (trial.target_label) {
          detailsParts.push(`Objetivo: ${trial.target_label}`);
        }

        return {
          id: trial.id,
          time: formatDurationClock(trial.trial_number - 1),
          eventType: trial.exercise_type,
          position: formatStimulusSide(trial.stimulus_side),
          result,
          details: detailsParts.join(" · ") || "Sin detalles",
        };
      });

      const detailData: SessionDetailData = {
        sessionId: session.id,
        sessionLabel: `Sesión ${new Date(session.started_at).toLocaleDateString("es-ES")}`,
        startedAt: session.started_at,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        score: session.score != null ? Number(session.score) : null,
        incidents: session.incidents,
        meanDetection: sessionMetrics?.mean_detection_latency_ms ?? null,
        omissionsLeft: sessionMetrics?.omissions_left ?? null,
        omissionsRight: sessionMetrics?.omissions_right ?? null,
        explorationBias: sessionMetrics?.exploration_bias_score ?? null,
        parameters,
        metrics: {
          totalStimuli,
          detectedStimuli: totalDetected,
          missedStimuli,
          leftDetections,
          rightDetections,
          centerDetections,
          reactionTimeMin:
            detectionLatencies.length > 0 ? Math.min(...detectionLatencies) : null,
          reactionTimeMax:
            detectionLatencies.length > 0 ? Math.max(...detectionLatencies) : null,
          fixationCount: fixationCounts,
          accuracy,
        },
        events,
        doctorNotes: session.notes,
      };

      setSelectedSessionDetail(detailData);
      setLoadingSessionDetail(false);
    };

    loadSessionDetail();
  }, [selectedSessionId, sessionView]);

  const handleOpenSessionDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSessionView("detail");
  };

  const handleBackToSessionList = () => {
    setSelectedSessionId(null);
    setSelectedSessionDetail(null);
    setSessionView("list");
  };

  const handleChangeTab = (tab: PatientTab) => {
    setActiveTab(tab);

    if (tab !== "sessions") {
      setSessionView("list");
      setSelectedSessionId(null);
      setSelectedSessionDetail(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <PatientDetailsContainer patient={patient} />;

      case "metrics":
        return (
          <PatientMetricsContainer patientId={patient.id} mode="metrics" />
        );

      case "sessions":
        if (sessionView === "detail" && selectedSessionId) {
          if (loadingSessionDetail) {
            return (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <p className="text-gray-600">Cargando detalle de sesión...</p>
              </div>
            );
          }

          if (!selectedSessionDetail) {
            return (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <button
                  onClick={handleBackToSessionList}
                  className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
                >
                  Volver a sesiones
                </button>
                <p className="text-red-600">
                  No se pudo cargar el detalle de la sesión.
                </p>
              </div>
            );
          }

          return (
            <SessionDetailContainer
              session={selectedSessionDetail}
              onBack={handleBackToSessionList}
            />
          );
        }

        return (
          <PatientMetricsContainer
            patientId={patient.id}
            mode="sessions"
            onViewDetail={handleOpenSessionDetail}
          />
        );

        case "vr":
  return (
    <VRExercisesContainer
      patientId={patient.id}
      patientName={`${patient.first_name} ${patient.last_name || ""}`}
    />
  );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              {patient.first_name} {patient.last_name || ""}
            </h1>

            <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Severidad: {formatSeverity(patient.severity)}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Lado afectado: {formatNeglectSide(patient.neglect_side)}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Última sesión: {latestSessionLabel}
              </span>
            </div>

            <p className="text-gray-500 mt-4">
              Vista general del paciente
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onStartSession?.(patient)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
            >
              Nueva sesión VR
            </button>

            <button
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
            >
              Volver a pacientes
            </button>
          </div>
        </div>
      </div>

      <PatientViewHeader
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
      />

      <div className="transition-all duration-300 ease-in-out animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
}